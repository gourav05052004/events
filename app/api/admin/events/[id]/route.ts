import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { Event, EventRegistration, Resource } from '@/models';
// Notification system removed: Student/Notification imports not required here
import { Types } from 'mongoose';
import ExcelJS from 'exceljs';

type PopulatedStudent = {
  _id: Types.ObjectId;
  name?: string;
  roll_number?: string;
  email?: string;
};

type RegistrationRecord = {
  _id: Types.ObjectId;
  student_id?: PopulatedStudent | null;
  status: 'CONFIRMED' | 'WAITLISTED';
  registered_at: Date;
  email?: string;
};

type EventRecord = Record<string, unknown> & {
  _id: Types.ObjectId;
  max_participants: number;
};

type ResourceRecord = {
  name: string;
};

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
      .lean<EventRecord>();

    if (!event) {
      return NextResponse.json(
        { success: false, error: 'Event not found' },
        { status: 404 }
      );
    }

    // Get registrations with student details
    const registrations = await EventRegistration.find({ event_id: id })
      .populate('student_id', 'name roll_number email')
      .sort({ registered_at: -1 })
      .lean<RegistrationRecord[]>();

    const registrationCount = registrations.length;
    const confirmedCount = registrations.filter((r) => r.status === 'CONFIRMED').length;
    const waitlistedCount = registrations.filter((r) => r.status === 'WAITLISTED').length;

    const mappedRegistrations = registrations.map((registration) => ({
      _id: registration._id,
      name: registration.student_id?.name || 'N/A',
      rollNumber: registration.student_id?.roll_number || 'N/A',
      email: registration.student_id?.email || registration.email || 'N/A',
      status: registration.status,
      registeredOn: registration.registered_at,
    }));

    // Excel export
    if (request.nextUrl.searchParams.get('export') === 'xlsx') {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Registrations');
      worksheet.columns = [
        { header: 'Name', key: 'name', width: 25 },
        { header: 'Roll Number', key: 'rollNumber', width: 15 },
        { header: 'Email', key: 'email', width: 30 },
        { header: 'Status', key: 'status', width: 15 },
        { header: 'Registered On', key: 'registeredOn', width: 15 },
      ];
      for (const r of mappedRegistrations) {
        worksheet.addRow({
          name: r.name,
          rollNumber: r.rollNumber,
          email: r.email,
          status: r.status,
          registeredOn: new Date(r.registeredOn).toLocaleDateString(),
        });
      }
      const buffer = await workbook.xlsx.writeBuffer();
      return new Response(buffer as ArrayBuffer, {
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Disposition': `attachment; filename="registrations-${id}.xlsx"`,
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        ...event,
        registrations: mappedRegistrations,
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
        const venue = await Resource.findById(allocated_resource_id).lean<ResourceRecord>();
        if (venue) {
          event.location = venue.name; // Set location to venue name
        }
        event.allocated_resource_id = new Types.ObjectId(allocated_resource_id);
      } else {
        event.allocated_resource_id = null;
      }
    }

    const previousStatus = event.status;

    await event.save();

    // Notifications creation removed — approval proceeds without creating notifications

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
