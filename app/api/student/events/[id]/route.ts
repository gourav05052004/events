import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/middleware';
import connectDB from '@/lib/db';
import EventRegistration from '@/models/EventRegistration';
import Event from '@/models/Event';
import Team from '@/models/Team';
import TeamMember from '@/models/TeamMember';

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

    const crypto = require('crypto');
    const secret = process.env.JWT_SECRET || 'fallback_secret';
    const consentCode = crypto
      .createHash('sha256')
      .update(`${objectStudentId.toString()}-${eventId}-${secret}`)
      .digest('hex')
      .substring(0, 6)
      .toUpperCase();

    return NextResponse.json(
      {
        isRegistered: !!registration,
        registration: registration || null,
        consentCode,
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
    // Check event registration deadline before allowing cancellation
    const event = await Event.findById(eventId);
    if (event && event.registration_deadline) {
      const dl = new Date(event.registration_deadline);
      if (!isNaN(dl.getTime()) && new Date() > dl) {
        return NextResponse.json(
          { error: 'Cancellation period has ended' },
          { status: 400 }
        );
      }
    }

    // Find the registration first
    const registration = await EventRegistration.findOne({
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

    let deleteCount = 1;

    // Check if it is a team registration and clean up
    let teamId = registration.team_id;
    if (!teamId) {
      // Fallback: Find if student is in any team for this event (e.g. legacy/incomplete registration data)
      const memberRecord = await TeamMember.findOne({ student_id: objectStudentId });
      if (memberRecord) {
        const matchingTeam = await Team.findOne({ _id: memberRecord.team_id, event_id: eventId });
        if (matchingTeam) {
          teamId = matchingTeam._id;
        }
      }
    }

    if (teamId) {
      const team = await Team.findById(teamId);
      if (team) {
        const isLeader = team.team_leader_id.toString() === objectStudentId.toString();
        if (isLeader) {
          // Dissolve the entire team
          const teamRegistrations = await EventRegistration.find({
            event_id: eventId,
            team_id: team._id
          });
          deleteCount = teamRegistrations.length;

          // Delete all team registrations
          await EventRegistration.deleteMany({
            event_id: eventId,
            team_id: team._id
          });

          // Delete all team member records
          await TeamMember.deleteMany({ team_id: team._id });

          // Delete team record
          await Team.findByIdAndDelete(team._id);
        } else {
          return NextResponse.json(
            { error: 'Only the team leader can cancel the team registration' },
            { status: 403 }
          );
        }
      } else {
        // Fallback if team record is missing
        await EventRegistration.findByIdAndDelete(registration._id);
      }
    } else {
      // Individual registration
      await EventRegistration.findByIdAndDelete(registration._id);
    }

    // Update event registrations count
    await Event.findByIdAndUpdate(eventId, {
      $inc: { registrations: -deleteCount },
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

