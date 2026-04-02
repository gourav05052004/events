import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { Event, EventRegistration, Resource } from '@/models';
import { Types } from 'mongoose';

type VenueRecord = {
  _id: Types.ObjectId;
  name: string;
  type: 'HALL' | 'ROOM' | 'LAB';
  location: string;
  capacity: number;
  amenities: string[];
  manager: string;
  contact: string;
  booked_events: number;
  manual_status?: 'available' | 'partially_booked' | 'full_booked' | null;
  created_at: Date;
};

type PopulatedClub = {
  club_name?: string;
};

type EventRecord = {
  _id: Types.ObjectId;
  title: string;
  primary_club_id?: PopulatedClub | Types.ObjectId | null;
  date: Date;
  status: 'PENDING' | 'APPROVED' | 'RESCHEDULED' | 'CANCELLED';
  max_participants: number;
};

function isPopulatedClub(
  value: PopulatedClub | Types.ObjectId | null | undefined
): value is PopulatedClub {
  return (
    value !== null &&
    value !== undefined &&
    typeof value === 'object' &&
    !(value instanceof Types.ObjectId) &&
    'club_name' in value
  );
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ venueId: string }> }
) {
  try {
    await connectDB();

    const { venueId } = await params;

    if (!Types.ObjectId.isValid(venueId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid venue ID' },
        { status: 400 }
      );
    }

    const venue = await Resource.findById(venueId).lean<VenueRecord>();

    if (!venue) {
      return NextResponse.json(
        { success: false, error: 'Venue not found' },
        { status: 404 }
      );
    }

    const events = await Event.find({ allocated_resource_id: venueId })
      .populate('primary_club_id', 'club_name')
      .lean<EventRecord[]>();

    const eventsWithCounts = await Promise.all(
      events.map(async (event) => {
        const registrationCount = await EventRegistration.countDocuments({
          event_id: event._id,
          status: 'CONFIRMED',
        });

        const organizer = isPopulatedClub(event.primary_club_id)
          ? event.primary_club_id.club_name || 'N/A'
          : 'N/A';

        return {
          _id: event._id,
          title: event.title,
          organizer,
          date: event.date,
          status: event.status,
          capacity: event.max_participants,
          registrationCount,
        };
      })
    );

    const now = new Date();
    const totalBookings = eventsWithCounts.length;
    const upcomingBookings = eventsWithCounts.filter((event) => new Date(event.date) > now).length;
    const pastBookings = eventsWithCounts.filter((event) => new Date(event.date) <= now).length;
    const utilizationRate = venue.capacity
      ? ((totalBookings / venue.capacity) * 100).toFixed(1)
      : '0.0';

    const availability = venue.manual_status
      ? venue.manual_status
      : totalBookings >= 5
        ? 'full_booked'
        : totalBookings >= 3
          ? 'partially_booked'
          : 'available';

    return NextResponse.json({
      success: true,
      data: {
        venue: {
          ...venue,
          availability,
        },
        events: eventsWithCounts,
        stats: {
          totalBookings,
          upcomingBookings,
          pastBookings,
          utilizationRate,
        },
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ venueId: string }> }
) {
  try {
    await connectDB();
    const { venueId } = await params;

    if (!Types.ObjectId.isValid(venueId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid venue ID' },
        { status: 400 }
      );
    }

    const body = await request.json();

    // If only manual_status is being updated, allow it
    if (body.manual_status) {
      const venue = await Resource.findByIdAndUpdate(
        venueId,
        { manual_status: body.manual_status },
        { new: true, runValidators: true }
      );

      if (!venue) {
        return NextResponse.json({ success: false, error: 'Venue not found' }, { status: 404 });
      }

      return NextResponse.json({ success: true, data: venue });
    }

    // Validate required fields for full update
    if (!body.name || !body.location || body.capacity === undefined) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const venue = await Resource.findByIdAndUpdate(
      venueId,
      {
        name: body.name,
        location: body.location,
        capacity: body.capacity,
        type: body.type,
        amenities: body.amenities || [],
        manager: body.manager,
        contact: body.contact,
        manual_status: body.manual_status || null,
      },
      { new: true, runValidators: true }
    );

    if (!venue) {
      return NextResponse.json({ success: false, error: 'Venue not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: venue });
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to update venue' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ venueId: string }> }
) {
  try {
    await connectDB();

    const { venueId } = await params;

    if (!Types.ObjectId.isValid(venueId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid venue ID' },
        { status: 400 }
      );
    }

    const venue = await Resource.findByIdAndDelete(venueId);

    if (!venue) {
      return NextResponse.json({ success: false, error: 'Venue not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: venue });
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to delete venue' }, { status: 500 });
  }
}
