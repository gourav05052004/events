import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { Event, EventRegistration, Club } from '@/models';

/**
 * GET /api/admin/events
 * Fetch all events with related club information
 */
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const events = await Event.find()
      .populate('primary_club_id', 'club_name email logo brand_color')
      .populate('allocated_resource_id', 'name resource_type')
      .sort({ date: -1 })
      .lean();

    // Get registration count for each event
    const eventsWithRegistrations = await Promise.all(
      events.map(async (event: any) => {
        const registrationCount = await EventRegistration.countDocuments({
          event_id: event._id,
        });

        return {
          _id: event._id,
          title: event.title,
          club_name: event.primary_club_id?.club_name || 'Unknown Club',
          club_email: event.primary_club_id?.email || '',
          club_logo: event.primary_club_id?.logo || '',
          club_brand_color: event.primary_club_id?.brand_color || '#8B1E26',
          date: event.date,
          end_date: event.end_date,
          start_time: event.start_time,
          end_time: event.end_time,
          location: event.location,
          status: event.status,
          registrations: registrationCount,
          max_participants: event.max_participants,
          min_team_members: event.min_team_members ?? null,
          max_team_members: event.max_team_members ?? null,
          event_type: event.event_type,
          resource_type: event.requested_resource_type,
          description: event.description,
          poster_url: event.poster_url || '',
          created_at: event.created_at,
        };
      })
    );

    return NextResponse.json({
      success: true,
      data: eventsWithRegistrations,
      count: eventsWithRegistrations.length,
    });
  } catch (error) {
    console.error('Error fetching events:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch events' },
      { status: 500 }
    );
  }
}
