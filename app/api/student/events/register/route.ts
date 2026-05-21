import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/middleware';
import connectDB from '@/lib/db';
import EventRegistration from '@/models/EventRegistration';
import Event from '@/models/Event';
import Student from '@/models/Student';
import Team from '@/models/Team';
import TeamMember from '@/models/TeamMember';

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const payload = requireAuth(request);
    if (payload instanceof NextResponse) {
      return payload;
    }

    const studentId = payload.id;
    const body = await request.json();
    const { eventId, registrationType, members, teamName } = body;

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
    console.log('  registrationType:', registrationType);

    // Verify event exists
    const event = await Event.findById(eventId);
    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    // Check registration deadline
    if (event.registration_deadline) {
      const dl = new Date(event.registration_deadline);
      if (!isNaN(dl.getTime()) && new Date() > dl) {
        return NextResponse.json(
          { error: 'Registration deadline has passed' },
          { status: 400 }
        );
      }
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

      console.log('✅ Individual Registration Saved:');
      console.log('  _id:', registration._id);
      console.log('  event_id:', registration.event_id);
      console.log('  student_id:', registration.student_id);

      return NextResponse.json(
        {
          success: true,
          message: 'Successfully registered for the event',
          registration,
        },
        { status: 201 }
      );
    }

    // Handle team registration
    if (registrationType === 'team' && members && Array.isArray(members)) {
      // Validate team name
      if (!teamName || typeof teamName !== 'string' || teamName.trim().length === 0) {
        return NextResponse.json(
          { error: 'Team name is required' },
          { status: 400 }
        );
      }

      // Total team size = leader + members
      const totalTeamSize = members.length + 1;

      // Validate team size against event min/max
      const minTeam = event.min_team_members || 2;
      const maxTeam = event.max_team_members || 10;

      if (totalTeamSize < minTeam) {
        return NextResponse.json(
          { error: `Team must have at least ${minTeam} members (including you). You currently have ${totalTeamSize}.` },
          { status: 400 }
        );
      }

      if (totalTeamSize > maxTeam) {
        return NextResponse.json(
          { error: `Team can have at most ${maxTeam} members (including you). You currently have ${totalTeamSize}.` },
          { status: 400 }
        );
      }

      // Check capacity for the team (total slots required = leader + members)
      if (registrationCount + totalTeamSize > event.max_participants) {
        return NextResponse.json(
          { error: `Not enough slots available. Remaining slots: ${event.max_participants - registrationCount}.` },
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
          { error: 'You are already registered for this event' },
          { status: 400 }
        );
      }

      // Check if student already has a team for this event
      const existingTeam = await Team.findOne({
        event_id: eventId,
        team_leader_id: objectStudentId,
      });

      if (existingTeam) {
        // Check if there is an active registration for this leader for this event
        const leaderReg = await EventRegistration.findOne({
          event_id: eventId,
          student_id: objectStudentId,
          team_id: existingTeam._id
        });

        if (!leaderReg) {
          // This is an orphan team! Clean it up.
          console.log(`🧹 Found orphan team ${existingTeam._id} ("${existingTeam.team_name}") with no leader registration. Cleaning up.`);
          await TeamMember.deleteMany({ team_id: existingTeam._id });
          await Team.findByIdAndDelete(existingTeam._id);
        } else {
          return NextResponse.json(
            { error: 'You already have a team for this event' },
            { status: 400 }
          );
        }
      }

      // Validate team members
      const memberEmails = members.map((m: any) => m.email.trim().toLowerCase());
      
      // Find all students in system corresponding to these emails
      const students = await Student.find({ email: { $in: memberEmails } });
      const foundEmails = students.map(s => s.email.toLowerCase());
      const missingEmails = memberEmails.filter(email => !foundEmails.includes(email));

      if (missingEmails.length > 0) {
        return NextResponse.json(
          { error: `The following team member email(s) are not registered on V-Sphere: ${missingEmails.join(', ')}. Please ask them to sign up first.` },
          { status: 400 }
        );
      }

      const crypto = require('crypto');
      const secret = process.env.JWT_SECRET || 'fallback_secret';
      
      for (const member of members) {
        const student = students.find((s: any) => s.email.toLowerCase() === member.email.trim().toLowerCase());
        if (student) {
          const expectedCode = crypto
            .createHash('sha256')
            .update(`${student._id.toString()}-${eventId}-${secret}`)
            .digest('hex')
            .substring(0, 6)
            .toUpperCase();
            
          if (!member.consentCode || member.consentCode.trim().toUpperCase() !== expectedCode) {
            return NextResponse.json(
              { error: `Invalid consent code for member ${member.email}. Make sure they provided their exact team consent code.` },
              { status: 400 }
            );
          }
        }
      }

      // Find if any of the team members (or leader) are already registered for this event
      const memberStudentIds = students.map(s => s._id);
      const allStudentIds = [objectStudentId, ...memberStudentIds];

      const existingRegistrations = await EventRegistration.find({
        event_id: eventId,
        student_id: { $in: allStudentIds }
      }).populate('student_id', 'name email');

      if (existingRegistrations.length > 0) {
        const registeredNames = existingRegistrations.map((r: any) => `${r.student_id?.name || 'Unknown'} (${r.student_id?.email || ''})`);
        return NextResponse.json(
          { error: `The following student(s) are already registered for this event: ${registeredNames.join(', ')}.` },
          { status: 400 }
        );
      }

      // Create Team record
      const team = await Team.create({
        event_id: eventId,
        team_name: teamName.trim(),
        team_leader_id: objectStudentId,
      });

      console.log('✅ Team Created:', team._id, team.team_name);

      // Add leader as first team member
      await TeamMember.create({
        team_id: team._id,
        student_id: objectStudentId,
      });

      // Create EventRegistration for the team leader
      const registration = new EventRegistration({
        event_id: eventId,
        student_id: objectStudentId,
        team_id: team._id,
        status: 'CONFIRMED',
      });
      await registration.save();

      // Add other team members and register them
      for (const student of students) {
        await TeamMember.create({
          team_id: team._id,
          student_id: student._id,
        });

        await EventRegistration.create({
          event_id: eventId,
          student_id: student._id,
          team_id: team._id,
          status: 'CONFIRMED',
        });
      }

      console.log('✅ Team Registration Saved:');
      console.log('  team_id:', team._id);
      console.log('  team_name:', team.team_name);
      console.log('  leader:', objectStudentId.toString());
      console.log('  total members:', totalTeamSize);

      return NextResponse.json(
        {
          success: true,
          message: `Team "${teamName.trim()}" registered successfully with ${totalTeamSize} members`,
          registration,
          team: {
            id: team._id,
            name: team.team_name,
            memberCount: totalTeamSize,
          },
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
