import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/middleware';
import connectDB from '@/lib/db';
import EventRegistration from '@/models/EventRegistration';
import Event from '@/models/Event';
import Student from '@/models/Student';

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const payload = requireAuth(request);
    if (payload instanceof NextResponse) {
      return payload;
    }

    const studentId = payload.id;
    const body = await request.json();
    const { eventId, registrationType, members } = body;

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
    
    console.log('🔍 Registration Request:');
    console.log('  studentId (from token):', studentId);
    console.log('  objectStudentId (converted):', objectStudentId.toString());
    console.log('  eventId:', eventId);

    // Verify event exists
    const event = await Event.findById(eventId);
    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    // Check if event is full
    const registrationCount = await EventRegistration.countDocuments({
      event_id: eventId,
    });

    if (registrationCount >= event.max_participants) {
      return NextResponse.json(
        { error: 'Event is at full capacity' },
        { status: 400 }
      );
    }

    // Handle individual registration
    if (registrationType === 'individual') {
      // Check if already registered
      const existingReg = await EventRegistration.findOne({
        event_id: eventId,
        student_id: objectStudentId,
      });

      if (existingReg) {
        return NextResponse.json(
          { error: 'Already registered for this event' },
          { status: 400 }
        );
      }

      // Create registration
      const registration = new EventRegistration({
        event_id: eventId,
        student_id: objectStudentId,
        status: 'CONFIRMED',
      });

      await registration.save();
      
      console.log('✅ Registration Saved:');
      console.log('  _id:', registration._id);
      console.log('  event_id:', registration.event_id);
      console.log('  student_id:', registration.student_id);
      console.log('  student_id type:', typeof registration.student_id);

      // Update event registrations count
      await Event.findByIdAndUpdate(eventId, {
        $inc: { registrations: 1 },
      });

      return NextResponse.json(
        {
          success: true,
          message: 'Successfully registered for the event',
          registration,
        },
        { status: 201 }
      );
    }

    // Handle group registration
    if (registrationType === 'group' && members && Array.isArray(members)) {
      // Validate group members
      if (members.length === 0) {
        return NextResponse.json(
          { error: 'At least one group member is required' },
          { status: 400 }
        );
      }

      // Check capacity for group
      const totalParticipants = members.length + 1; // +1 for the student itself
      if (registrationCount + totalParticipants > event.max_participants) {
        return NextResponse.json(
          {
            error: `Not enough seats available. Event has ${
              event.max_participants - registrationCount
            } seats remaining but you need ${totalParticipants}`,
          },
          { status: 400 }
        );
      }

      // Check if student is already registered
      const existingReg = await EventRegistration.findOne({
        event_id: eventId,
        student_id: objectStudentId,
      });

      if (existingReg) {
        return NextResponse.json(
          { error: 'Already registered for this event' },
          { status: 400 }
        );
      }

      // Create registrations for all group members
      const registrations = [];

      // Register the main student
      const mainReg = new EventRegistration({
        event_id: eventId,
        student_id: objectStudentId,
        status: 'CONFIRMED',
      });
      registrations.push(mainReg);
      await mainReg.save();

      // Register group members (create temporary entries if not existing students)
      for (const member of members) {
        // Try to find student by email
        let student = await Student.findOne({ email: member.email });

        if (!student) {
          // If student doesn't exist, we'll store their info in a group_members collection
          // For now, we'll skip registration but log the member info
          console.log(`Group member not found: ${member.email}. Adding to pending members.`);
        } else {
          // Check if member is already registered
          const memberReg = await EventRegistration.findOne({
            event_id: eventId,
            student_id: student._id,
          });

          if (!memberReg) {
            const groupMemberReg = new EventRegistration({
              event_id: eventId,
              student_id: student._id,
              status: 'CONFIRMED',
            });
            registrations.push(groupMemberReg);
            await groupMemberReg.save();
          }
        }
      }

      // Update event registrations count
      await Event.findByIdAndUpdate(eventId, {
        $inc: { registrations: registrations.length },
      });

      return NextResponse.json(
        {
          success: true,
          message: `Group registered successfully with ${registrations.length} members`,
          registrations,
          pendingMembers: members.filter((m) => !Student.findOne({ email: m.email })),
        },
        { status: 201 }
      );
    }

    return NextResponse.json(
      { error: 'Invalid registration type' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Failed to process registration' },
      { status: 500 }
    );
  }
}
