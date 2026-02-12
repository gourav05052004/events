import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { Resource, Event } from '@/models';

/**
 * Helper function to check if two time ranges overlap
 * Format: HH:MM
 */
function timeRangesOverlap(
  start1: string,
  end1: string,
  start2: string,
  end2: string
): boolean {
  const toMinutes = (time: string): number => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  };

  const start1Min = toMinutes(start1);
  const end1Min = toMinutes(end1);
  const start2Min = toMinutes(start2);
  const end2Min = toMinutes(end2);

  // Check for overlap (inclusive of start time, exclusive of end time)
  return start1Min < end2Min && start2Min < end1Min;
}

/**
 * GET /api/admin/venues
 * Fetch all venues with booking information
 * Query params: eventDate (ISO string), startTime (HH:MM), endTime (HH:MM), eventId (to exclude current event)
 */
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const searchParams = request.nextUrl.searchParams;
    const eventDate = searchParams.get('eventDate');
    const startTime = searchParams.get('startTime');
    const endTime = searchParams.get('endTime');
    const eventId = searchParams.get('eventId');

    const venues = await Resource.find().sort({ name: 1 }).lean();

    // Get booking count for each venue
    const venuesWithBookings = await Promise.all(
      venues.map(async (venue: any) => {
        const bookedCount = await Event.countDocuments({
          allocated_resource_id: venue._id,
          status: { $ne: 'CANCELLED' },
        });

        // Determine availability status - use manual status if set, otherwise calculate
        let availability = venue.manual_status;
        if (!availability) {
          availability = 'available';
          if (bookedCount >= 3 && bookedCount < 5) {
            availability = 'partially_booked';
          } else if (bookedCount >= 5) {
            availability = 'full_booked';
          }
        }

        // Check for time conflicts if date and time are provided
        let hasTimeConflict = false;
        let conflictingEvent = null;

        if (eventDate && startTime && endTime) {
          const targetDate = new Date(eventDate);
          targetDate.setHours(0, 0, 0, 0); // Start of day
          const nextDate = new Date(targetDate);
          nextDate.setDate(nextDate.getDate() + 1); // End of day

          // Find all events booked on this venue for the same date
          const conflictingEvents = await Event.find({
            allocated_resource_id: venue._id,
            status: { $ne: 'CANCELLED' },
            date: { $gte: targetDate, $lt: nextDate },
            _id: { $ne: eventId || null }, // Exclude current event if editing
          }).lean();

          // Check if any event has time overlap
          if (conflictingEvents.length > 0) {
            for (const event of conflictingEvents) {
              if (timeRangesOverlap(startTime, endTime, event.start_time, event.end_time)) {
                hasTimeConflict = true;
                conflictingEvent = {
                  _id: event._id,
                  title: event.title,
                  start_time: event.start_time,
                  end_time: event.end_time,
                };
                break;
              }
            }
          }
        }

        return {
          _id: venue._id,
          name: venue.name,
          location: venue.location,
          capacity: venue.capacity,
          type: venue.type,
          amenities: venue.amenities || [],
          bookedEvents: bookedCount,
          availability,
          manager: venue.manager,
          contact: venue.contact,
          hasTimeConflict,
          conflictingEvent,
        };
      })
    );

    // Filter out venues with time conflicts (optional - we'll let frontend handle display)
    const availableVenues = venuesWithBookings.filter((v) => !v.hasTimeConflict);

    return NextResponse.json({
      success: true,
      data: availableVenues,
      allVenues: venuesWithBookings, // Include all with conflict info for UI display
      count: availableVenues.length,
    });
  } catch (error) {
    console.error('Error fetching venues:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch venues' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/venues
 * Create a new venue
 */
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();

    // Validate required fields
    if (!body.name || !body.location || body.capacity === undefined) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: name, location, capacity' },
        { status: 400 }
      );
    }

    // Create new venue
    const newVenue = new Resource({
      name: body.name,
      location: body.location,
      capacity: body.capacity,
      type: body.type || 'HALL',
      amenities: body.amenities || [],
      manager: body.manager || '',
      contact: body.contact || '',
      booked_events: 0,
    });

    await newVenue.save();

    return NextResponse.json(
      {
        success: true,
        data: {
          _id: newVenue._id,
          name: newVenue.name,
          location: newVenue.location,
          capacity: newVenue.capacity,
          type: newVenue.type,
          amenities: newVenue.amenities,
          bookedEvents: 0,
          availability: 'available',
          manager: newVenue.manager,
          contact: newVenue.contact,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating venue:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create venue' },
      { status: 500 }
    );
  }
}
