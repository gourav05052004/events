import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/middleware';
import connectDB from '@/lib/db';
import EventRegistration from '@/models/EventRegistration';
import Event from '@/models/Event';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    // Verify authentication
    const payload = requireAuth(request);
    if (payload instanceof NextResponse) {
      return payload;
    }

    // Await params to get the actual value
    const { id: eventId } = await params;
    const studentId = payload.id;

    if (!eventId) {
      return NextResponse.json(
        { error: 'Event ID is required' },
        { status: 400 }
      );
    }

    // Connect to database
    await connectDB();

    // Convert student ID to ObjectId for MongoDB queries
    const { ObjectId } = require('mongoose').Types;
    const objectStudentId = new ObjectId(studentId);

    // Check if student is already registered for this event
    // Try both ObjectId and string formats in case of data inconsistency
    const registration = await EventRegistration.findOne({
      event_id: eventId,
      $or: [
        { student_id: objectStudentId },  // Try ObjectId match
        { student_id: studentId },         // Try string match (backward compatibility)
      ]
    });

    return NextResponse.json(
      {
        isRegistered: !!registration,
        registration: registration || null,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Check registration error:', error);
    return NextResponse.json(
      { error: 'Failed to check registration status' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    // Verify authentication
    const payload = requireAuth(request);
    if (payload instanceof NextResponse) {
      return payload;
    }

    // Await params to get the actual value
    const { id: eventId } = await params;
    const studentId = payload.id;

    if (!eventId) {
      return NextResponse.json(
        { error: 'Event ID is required' },
        { status: 400 }
      );
    }

    // Connect to database
    await connectDB();

    // Convert student ID to ObjectId for MongoDB queries
    const { ObjectId } = require('mongoose').Types;
    const objectStudentId = new ObjectId(studentId);

    // Find and delete the registration
    // Try both ObjectId and string formats in case of data inconsistency
    const registration = await EventRegistration.findOneAndDelete({
      event_id: eventId,
      $or: [
        { student_id: objectStudentId },  // Try ObjectId match
        { student_id: studentId },         // Try string match (backward compatibility)
      ]
    });

    if (!registration) {
      return NextResponse.json(
        { error: 'Registration not found' },
        { status: 404 }
      );
    }

    // Update event registrations count
    await Event.findByIdAndUpdate(eventId, {
      $inc: { registrations: -1 },
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Registration cancelled successfully',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Cancel registration error:', error);
    return NextResponse.json(
      { error: 'Failed to cancel registration' },
      { status: 500 }
    );
  }
}

