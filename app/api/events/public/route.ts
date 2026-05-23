import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { Event, EventRegistration } from '@/models';

export const revalidate = 60;

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

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const queryConditions: any = {
      status: 'APPROVED',
    };

    if (yearStart && yearEnd) {
      const startLimit = new Date(yearStart);
      const endLimit = new Date(yearEnd);
      const lowerBound = startLimit > today ? startLimit : today;

      queryConditions.$or = [
        { date: { $gte: lowerBound, $lte: endLimit } },
        { end_date: { $gte: lowerBound }, date: { $gte: startLimit, $lte: endLimit } },
      ];
    } else {
      queryConditions.$or = [
        { date: { $gte: today } },
        { end_date: { $gte: today } },
      ];
    }

    const events = await Event.find(queryConditions)
      .populate('primary_club_id', 'club_name logo brand_color')
      .populate('allocated_resource_id', 'name location')
      .sort({ date: -1 })
      .lean<PublicEventRecord[]>();

    const eventIds = events.map(e => e._id);
    const registrationCounts = await EventRegistration.aggregate([
      { $match: { event_id: { $in: eventIds } } },
      { $group: { _id: '$event_id', count: { $sum: 1 } } }
    ]);
    const countsMap = new Map(registrationCounts.map(r => [r._id.toString(), r.count]));

    const publicEvents = events.map((event) => {
      const registrations = countsMap.get(String(event._id)) || 0;

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
    });

    return NextResponse.json({ success: true, events: publicEvents }, { status: 200 });
  } catch (error) {
    console.error('Public events fetch error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch events', events: [] },
      { status: 500 }
    );
  }
}