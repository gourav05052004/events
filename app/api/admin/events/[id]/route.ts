import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { Event, EventRegistration, Club, Student, Resource } from '@/models';
import { Types } from 'mongoose';

/**
 * GET /api/admin/events/[id]
 * Fetch a specific event with all details and registrations
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const { id } = await params;

    if (!Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid event ID' },
        { status: 400 }
      );
    }

    const event = await Event.findById(id)
      .populate('primary_club_id', 'club_name email faculty_coordinator_name')
      .populate('allocated_resource_id', 'name resource_type location')
      .lean() as any;

    if (!event) {
      return NextResponse.json(
        { success: false, error: 'Event not found' },
        { status: 404 }
      );
    }

    // Get registrations with student details
    const registrations = await EventRegistration.find({ event_id: id })
      .populate('student_id', 'student_name email rollNumber')
      .sort({ registered_at: -1 })
      .lean();

    const registrationCount = registrations.length;
    const confirmedCount = registrations.filter((r: any) => r.status === 'CONFIRMED').length;
    const waitlistedCount = registrations.filter((r: any) => r.status === 'WAITLISTED').length;

    return NextResponse.json({
      success: true,
      data: {
        ...event,
        registrations: registrations.map((r: any) => ({
          _id: r._id,
          student_id: r.student_id?._id,
          student_name: r.student_id?.student_name || 'Unknown',
          email: r.student_id?.email || '',
          roll_number: r.student_id?.rollNumber || '',
          status: r.status,
          registered_at: r.registered_at,
        })),
        registration_summary: {
          total: registrationCount,
          confirmed: confirmedCount,
          waitlisted: waitlistedCount,
          available_spots: Math.max(0, event.max_participants - confirmedCount),
        },
      },
    });
  } catch (error) {
    console.error('Error fetching event:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch event' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/events/[id]
 * Update event status and details
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const { id } = await params;
    const body = await request.json();
    const { status, location, description, allocated_resource_id } = body;

    if (!Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid event ID' },
        { status: 400 }
      );
    }

    const event = await Event.findById(id);

    if (!event) {
      return NextResponse.json(
        { success: false, error: 'Event not found' },
        { status: 404 }
      );
    }

    // Update allowed fields
    if (status && ['PENDING', 'APPROVED', 'RESCHEDULED', 'CANCELLED'].includes(status)) {
      event.status = status;
    }

    if (location !== undefined) {
      event.location = location;
    }

    if (description !== undefined) {
      event.description = description;
    }

    // If allocating a venue, fetch venue details and set location from it
    if (allocated_resource_id !== undefined) {
      if (allocated_resource_id) {
        const venue = await Resource.findById(allocated_resource_id).lean() as any;
        if (venue) {
          event.location = venue.name; // Set location to venue name
        }
        event.allocated_resource_id = new Types.ObjectId(allocated_resource_id);
      } else {
        event.allocated_resource_id = null;
      }
    }

    await event.save();

    // Fetch updated event with relations
    const updatedEvent = await Event.findById(id)
      .populate('primary_club_id', 'club_name email')
      .populate('allocated_resource_id', 'name resource_type location')
      .lean();

    return NextResponse.json({
      success: true,
      message: 'Event updated successfully',
      data: updatedEvent,
    });
  } catch (error) {
    console.error('Error updating event:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update event' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/events/[id]
 * Cancel an event
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const { id } = await params;

    if (!Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid event ID' },
        { status: 400 }
      );
    }

    const event = await Event.findById(id);

    if (!event) {
      return NextResponse.json(
        { success: false, error: 'Event not found' },
        { status: 404 }
      );
    }

    // Soft delete by marking as CANCELLED
    event.status = 'CANCELLED';
    await event.save();

    return NextResponse.json({
      success: true,
      message: 'Event cancelled successfully',
    });
  } catch (error) {
    console.error('Error deleting event:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to cancel event' },
      { status: 500 }
    );
  }
}
