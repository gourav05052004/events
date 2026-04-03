import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { Event, EventRegistration } from '@/models';

type PopulatedClub = {
  club_name?: string;
  logo?: string;
  brand_color?: string;
};

type PopulatedVenue = {
  name?: string;
  location?: string;
};

type PublicEventRecord = {
  _id: unknown;
  title: string;
  date: Date;
  end_date?: Date;
  start_time: string;
  end_time: string;
  location?: string;
  status: 'PENDING' | 'APPROVED' | 'RESCHEDULED' | 'CANCELLED';
  event_type: string;
  max_participants: number;
  poster_url?: string;
  categories?: string[];
  primary_club_id?: PopulatedClub | null;
  allocated_resource_id?: PopulatedVenue | null;
};

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const yearStart = searchParams.get('yearStart');
    const yearEnd = searchParams.get('yearEnd');

    const dateFilter =
      yearStart && yearEnd
        ? { date: { $gte: new Date(yearStart), $lte: new Date(yearEnd) } }
        : {};

    const events = await Event.find({
      status: 'APPROVED',
      ...dateFilter,
    })
      .populate('primary_club_id', 'club_name logo brand_color')
      .populate('allocated_resource_id', 'name location')
      .sort({ date: 1 })
      .lean<PublicEventRecord[]>();

    const publicEvents = await Promise.all(
      events.map(async (event) => {
        const registrations = await EventRegistration.countDocuments({ event_id: event._id });

        return {
          id: String(event._id),
          title: event.title,
          date: event.date,
          end_date: event.end_date,
          time: `${event.start_time} - ${event.end_time}`,
          location: event.location || event.allocated_resource_id?.location || 'TBD',
          image:
            event.poster_url ||
            'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=300&fit=crop',
          status: 'approved' as const,
          attendees: registrations,
          maxAttendees: event.max_participants,
          clubName: event.primary_club_id?.club_name || 'Unknown Club',
          clubLogo: event.primary_club_id?.logo || undefined,
          brandColor: event.primary_club_id?.brand_color || '#8B1E26',
          categories: event.categories || [],
        };
      })
    );

    return NextResponse.json({ success: true, events: publicEvents }, { status: 200 });
  } catch (error) {
    console.error('Public events fetch error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch events', events: [] },
      { status: 500 }
    );
  }
}