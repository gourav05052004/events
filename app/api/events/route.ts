import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Event from '@/models/Event';
import EventRegistration from '@/models/EventRegistration';
import '@/models/Club'; // Import Club to register the schema

/**
 * GET /api/events
 * Public endpoint to fetch upcoming approved events
 */
export async function GET() {
  try {
    await connectDB();

    const now = new Date();

    // Fetch upcoming approved events
    const events = await Event.find({
      status: 'APPROVED',
      date: { $gte: now },
    })
      .sort({ date: 1 })
      .limit(10)
      .populate('primary_club_id', 'club_name logo brand_color')
      .populate('collaborating_clubs', 'club_name')
      .lean();

    const eventIds = events.map((e: any) => e._id);
    const registrationCounts = await EventRegistration.aggregate([
      { $match: { event_id: { $in: eventIds } } },
      { $group: { _id: '$event_id', count: { $sum: 1 } } }
    ]);
    const countsMap = new Map(registrationCounts.map(r => [r._id.toString(), r.count]));

    // Get registration counts for each event
    const eventsWithCounts = events.map((event: any) => {
      const registrationCount = countsMap.get(event._id.toString()) || 0;

      return {
        id: event._id.toString(),
        title: event.title,
        date: event.date,
        end_date: event.end_date,
        time: `${event.start_time} - ${event.end_time}`,
        location: event.location || 'TBD',
        image: event.poster_url || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&h=300&fit=crop',
        status: event.status.toLowerCase(),
        attendees: registrationCount,
        maxAttendees: event.max_participants,
        clubName: event.primary_club_id?.club_name || 'Unknown Club',
        clubLogo: event.primary_club_id?.logo || undefined,
        brandColor: event.primary_club_id?.brand_color || '#8B1E26',
        collaboratingClubs: Array.isArray(event.collaborating_clubs)
          ? event.collaborating_clubs.map((c: any) => ({ id: String(c._id), name: c.club_name }))
          : [],
      };
    });

    return NextResponse.json(
      {
        success: true,
        events: eventsWithCounts,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Fetch events error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch events',
        events: [],
      },
      { status: 500 }
    );
  }
}
