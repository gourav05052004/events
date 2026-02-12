import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { Event } from '@/models';
import mongoose from 'mongoose';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const clubId = request.nextUrl.searchParams.get('clubId');
    console.log('[GET /api/club/events/list] Requested clubId:', clubId);
    
    if (!clubId || !mongoose.Types.ObjectId.isValid(clubId)) {
      console.error('[GET /api/club/events/list] Invalid clubId:', clubId);
      return NextResponse.json({ error: 'Valid club ID required' }, { status: 400 });
    }

    // First get the club details
    const Club = require('@/models').Club;
    const club = await Club.findById(clubId).lean();

    const query = { primary_club_id: new mongoose.Types.ObjectId(clubId) };
    console.log('[GET /api/club/events/list] Querying with:', JSON.stringify(query));

    const events = await Event.find(query)
      .sort({ created_at: -1 })
      .lean();

    console.log('[GET /api/club/events/list] Found events:', events.length);

    const formattedEvents = events.map((event: any) => ({
      id: event._id.toString(),
      title: event.title,
      date: new Date(event.date).toLocaleDateString('en-GB', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      }),
      time: event.start_time,
      location: event.location || 'TBD',
      image: event.poster_url || 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=300&h=200&fit=crop',
      status: event.status.toLowerCase(),
      attendees: 0, // TODO: Count from EventRegistration
      maxAttendees: event.max_participants,
      category: event.event_type,
      clubLogo: club?.logo || '',
      clubName: club?.club_name || 'Unknown Club',
      brandColor: club?.brand_color || '#8B1E26',
    }));

    return NextResponse.json({ events: formattedEvents }, { status: 200 });
  } catch (error) {
    console.error('[GET /api/club/events/list] Error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
