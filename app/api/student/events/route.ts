import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { Event, EventRegistration } from '@/models';

type PopulatedClub = {
  club_name?: string;
  logo?: string;
  brand_color?: string;
};

type PopulatedResource = {
  name?: string;
  location?: string;
  resource_type?: string;
};

type StudentEventRecord = {
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
  allocated_resource_id?: PopulatedResource | null;
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
      .populate('allocated_resource_id', 'name location resource_type')
      .sort({ date: 1 })
      .lean<StudentEventRecord[]>();

    const data = await Promise.all(
      events.map(async (event) => {
        const registrations = await EventRegistration.countDocuments({ event_id: event._id });

        return {
          _id: String(event._id),
          title: event.title,
          date: event.date,
          end_date: event.end_date,
          start_time: event.start_time,
          end_time: event.end_time,
          location: event.location || 'TBD',
          status: event.status,
          event_type: event.event_type,
          max_participants: event.max_participants,
          poster_url: event.poster_url || '',
          registrations,
          club_name: event.primary_club_id?.club_name || 'Unknown Club',
          club_logo: event.primary_club_id?.logo || '',
          club_brand_color: event.primary_club_id?.brand_color || '#8B1E26',
          venue_name: event.allocated_resource_id?.name || '',
          venue_location: event.allocated_resource_id?.location || '',
          categories: event.categories || [],
        };
      })
    );

    return NextResponse.json({ success: true, data }, { status: 200 });
  } catch (error) {
    console.error('Student events fetch error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch events' },
      { status: 500 }
    );
  }
}
