import { NextRequest, NextResponse } from 'next/server';
import { verifyRequestToken } from '@/lib/middleware';
import connectDB from '@/lib/db';
import { Event, EventRegistration } from '@/models';

/**
 * GET /api/admin/dashboard
 * Protected route - requires valid JWT token
 * Returns admin dashboard data
 */
export async function GET(request: NextRequest) {
  try {
    // Verify JWT token
    const payload = verifyRequestToken(request);
    if (!payload) {
      return NextResponse.json(
        { error: 'Unauthorized - Valid token required' },
        { status: 401 }
      );
    }

    // Connect to database
    try {
      await connectDB();
    } catch (dbErr) {
      console.error('Dashboard DB connection error:', dbErr);
      return NextResponse.json(
        { error: 'Failed to load the database', details: String((dbErr as Error)?.message ?? dbErr) },
        { status: 500 }
      );
    }

    // Parse optional year range filters from query params safely
    const { searchParams } = new URL(request.url);
    const yearStart = searchParams.get('yearStart');
    const yearEnd = searchParams.get('yearEnd');

    // Build date filter if both params provided; do not crash if missing
    let dateFilter: Record<string, unknown> = {};
    if (yearStart && yearEnd) {
      const startDate = new Date(yearStart);
      const endDate = new Date(yearEnd);
      if (!isNaN(startDate.getTime()) && !isNaN(endDate.getTime())) {
        dateFilter = { date: { $gte: startDate, $lte: endDate } };
      }
    }

    // Get dashboard statistics scoped to the date range when provided
    const totalEvents = await Event.countDocuments(dateFilter);

    const eventStatsAgg = await Event.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    // Convert eventStatsAgg to object with numeric keys for statuses
    const eventsByStatus = { approved: 0, pending: 0, rejected: 0 };
    for (const s of eventStatsAgg) {
      const key = String(s._id).toLowerCase();
      if (key === 'approved') eventsByStatus.approved = s.count;
      else if (key === 'pending') eventsByStatus.pending = s.count;
      else if (key === 'rejected') eventsByStatus.rejected = s.count;
    }

    // Pending events list (limit 5) within date range
    // Query pending events and populate related club and allocated resource
    const pendingEventsRaw = await Event.find({ ...dateFilter, status: 'PENDING' })
      .sort({ date: 1 })
      .limit(5)
      .populate('primary_club_id', 'club_name')
      .populate('allocated_resource_id', 'name')
      .lean();

    // Map to a lightweight shape expected by the frontend
    const pendingEvents = (pendingEventsRaw || []).map((ev: any) => {
      // Log the resolved primary_club_id so we can confirm populate worked
      console.log('Pending event primary_club_id resolved:', ev.primary_club_id);

      // Determine organizer display name. If populate provided the club object use its `club_name`.
      // If it's an ObjectId or plain value, show `Club #[id]` so callers can see the ID being looked up.
      let organizerDisplay = 'Club #unknown';
      const clubField = ev.primary_club_id;
      if (clubField) {
        if (typeof clubField === 'object' && clubField.club_name) {
          organizerDisplay = clubField.club_name;
        } else if (typeof clubField === 'object' && clubField._id) {
          organizerDisplay = `Club #${String(clubField._id)}`;
        } else {
          organizerDisplay = `Club #${String(clubField)}`;
        }
      }

      return {
        _id: ev._id,
        title: ev.title,
        organizer: organizerDisplay,
        date: ev.date,
        venue: ev.allocated_resource_id?.name || 'No Venue Assigned',
        capacity: ev.max_participants || 0,
        status: ev.status,
      };
    });

    // Active clubs and venues derived from events in range (distinct)
    const activeClubIds = await Event.distinct('primary_club_id', dateFilter);
    const totalClubs = activeClubIds ? activeClubIds.length : 0;

    const activeResourceIds = await Event.distinct('allocated_resource_id', dateFilter);
    const totalVenues = activeResourceIds ? activeResourceIds.length : 0;

    // Registration overview: compute total registrations and top events
    // Build a match stage for event date filtering inside registration pipelines
    const eventDateMatch = (dateFilter && (dateFilter as any).date) ? { 'eventDetails.date': (dateFilter as any).date } : null;

    // Total registrations for events in the date range
    const totalRegistrationsAgg = await EventRegistration.aggregate([
      {
        $lookup: {
          from: 'events',
          localField: 'event_id',
          foreignField: '_id',
          as: 'eventDetails',
        },
      },
      { $unwind: '$eventDetails' },
      ...(eventDateMatch ? [{ $match: eventDateMatch }] : []),
      { $count: 'total' },
    ]);

    const totalRegistrations = totalRegistrationsAgg[0]?.total || 0;

    const approvedEvents = eventsByStatus.approved || 0;
    const avgRegistrationsPerEvent = approvedEvents > 0 ? Number((totalRegistrations / approvedEvents).toFixed(1)) : 0;

    const topEventsAgg = await EventRegistration.aggregate([
      {
        $lookup: {
          from: 'events',
          localField: 'event_id',
          foreignField: '_id',
          as: 'eventDetails',
        },
      },
      { $unwind: '$eventDetails' },
      ...(eventDateMatch ? [{ $match: eventDateMatch }] : []),
      { $group: { _id: '$event_id', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 3 },
      {
        $lookup: {
          from: 'events',
          localField: '_id',
          foreignField: '_id',
          as: 'eventDetails',
        },
      },
      { $unwind: '$eventDetails' },
      { $project: { _id: '$_id', title: '$eventDetails.title', count: 1 } },
    ]);

    const registrationOverview = {
      total: totalRegistrations,
      avgPerEvent: avgRegistrationsPerEvent,
      topEvents: (topEventsAgg || []).map((e: any) => ({ _id: e._id, title: e.title, count: e.count })),
    };

    return NextResponse.json(
      {
        message: 'Admin dashboard data',
        admin: {
          id: payload.adminId,
          email: payload.email,
          name: payload.name,
        },
        statistics: {
          totalEvents: totalEvents || 0,
          eventsByStatus: eventsByStatus || { approved: 0, pending: 0, rejected: 0 },
          totalClubs: totalClubs || 0,
          totalVenues: totalVenues || 0,
          pendingEvents: pendingEvents || [],
          registrationOverview: registrationOverview,
        },
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Dashboard error:', error);
    const message = (error instanceof Error && error.message) ? error.message : String(error);
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
