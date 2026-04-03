import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { Event, EventRegistration } from '@/models';
import { formatDateRange } from '@/lib/utils';
import mongoose from 'mongoose';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const clubId = request.nextUrl.searchParams.get('clubId');
    const yearStart = request.nextUrl.searchParams.get('yearStart');
    const yearEnd = request.nextUrl.searchParams.get('yearEnd');

    const dateFilter =
      yearStart && yearEnd
        ? { date: { $gte: new Date(yearStart), $lte: new Date(yearEnd) } }
        : {};
    console.log('[GET /api/club/events/list] Requested clubId:', clubId);
    
    if (!clubId || !mongoose.Types.ObjectId.isValid(clubId)) {
      console.error('[GET /api/club/events/list] Invalid clubId:', clubId);
      return NextResponse.json({ error: 'Valid club ID required' }, { status: 400 });
    }

    // First get the club details
    const Club = require('@/models').Club;
    const club = await Club.findById(clubId).lean();

    const objectClubId = new mongoose.Types.ObjectId(clubId);
    const query = {
      ...dateFilter,
      $or: [
        { primary_club_id: objectClubId },
        { collaborating_clubs: objectClubId },
      ],
    };

    console.log('[GET /api/club/events/list] Querying with:', JSON.stringify(query));

    const events = await Event.find(query)
      .populate('primary_club_id', 'club_name logo brand_color')
      .populate('collaborating_clubs', 'club_name')
      .sort({ created_at: -1 })
      .lean();

    console.log('[GET /api/club/events/list] Found events:', events.length);

    // Count registrations for each event and format
    const formattedEvents = await Promise.all(
      events.map(async (event: any) => {
        const registrationCount = await EventRegistration.countDocuments({ event_id: event._id });

        const primaryClub = event.primary_club_id || club;
        const isOwner = String(primaryClub?._id || primaryClub?._id) === String(clubId);

        return {
          id: event._id.toString(),
          title: event.title,
          date: formatDateRange(event.date, event.end_date, 'en-GB'),
          startDate: event.date,
          endDate: event.end_date,
          time: event.start_time,
          location: event.location || 'TBD',
          image: event.poster_url || 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=300&h=200&fit=crop',
          status: event.status.toLowerCase(),
          attendees: registrationCount,
          maxAttendees: event.max_participants,
          category: event.event_type,
          clubLogo: primaryClub?.logo || '',
          clubName: primaryClub?.club_name || 'Unknown Club',
          brandColor: primaryClub?.brand_color || '#8B1E26',
          isOwner,
          collaboratingClubs: Array.isArray(event.collaborating_clubs)
            ? event.collaborating_clubs.map((c: any) => ({ id: String(c._id), name: c.club_name }))
            : [],
        };
      })
    );

    return NextResponse.json({ events: formattedEvents }, { status: 200 });
  } catch (error) {
    console.error('[GET /api/club/events/list] Error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
