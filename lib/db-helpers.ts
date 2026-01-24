import connectDB from './db';
import {
  Admin,
  Club,
  Student,
  Resource,
  Event,
  EventClub,
  EventRegistration,
  Team,
  TeamMember,
  EventSlot,
  ActivityLog,
  type IAdmin,
  type IClub,
  type IStudent,
  type IEvent,
  type IEventRegistration,
  type ITeam,
  type ActorType,
} from '@/models';

/**
 * Log activity for audit trail
 */
export async function logActivity(
  actorType: ActorType,
  actorId: string,
  action: string,
  targetEventId?: string
) {
  try {
    await connectDB();
    await ActivityLog.create({
      actor_type: actorType,
      actor_id: actorId,
      action,
      target_event_id: targetEventId || null,
    });
  } catch (error) {
    console.error('Error logging activity:', error);
  }
}

/**
 * Register student for event with slot management
 */
export async function registerStudentForEvent(
  eventId: string,
  studentId: string
): Promise<IEventRegistration | null> {
  try {
    await connectDB();

    // Check if student already registered
    const existingReg = await EventRegistration.findOne({
      event_id: eventId,
      student_id: studentId,
    });

    if (existingReg) {
      throw new Error('Student already registered for this event');
    }

    // Get event details
    const event = await Event.findById(eventId);
    if (!event) {
      throw new Error('Event not found');
    }

    // Check available slots
    const availableSlot = await EventSlot.findOne({
      event_id: eventId,
      allocated: false,
    });

    let status = 'CONFIRMED';
    if (!availableSlot) {
      // Add to waitlist if no slots available
      const registeredCount = await EventRegistration.countDocuments({
        event_id: eventId,
        status: 'CONFIRMED',
      });
      if (registeredCount >= event.max_participants) {
        status = 'WAITLISTED';
      }
    } else {
      // Allocate slot
      await EventSlot.updateOne(
        { _id: availableSlot._id },
        { allocated: true }
      );
    }

    // Create registration
    const registration = await EventRegistration.create({
      event_id: eventId,
      student_id: studentId,
      status,
    });

    return registration;
  } catch (error) {
    console.error('Error registering student:', error);
    return null;
  }
}

/**
 * Create event and initialize slots
 */
export async function createEventWithSlots(
  eventData: Partial<IEvent>
): Promise<IEvent | null> {
  try {
    await connectDB();

    // Create event
    const event = await Event.create(eventData);

    // Create slots for the event
    const slots = Array.from({ length: event.max_participants }, (_, i) => ({
      event_id: event._id,
      slot_number: i + 1,
      allocated: false,
    }));

    await EventSlot.insertMany(slots);

    return event;
  } catch (error) {
    console.error('Error creating event with slots:', error);
    return null;
  }
}

/**
 * Get event with all related data
 */
export async function getEventWithDetails(eventId: string) {
  try {
    await connectDB();

    const event = await Event.findById(eventId)
      .populate('primary_club_id')
      .populate('allocated_resource_id');

    if (!event) return null;

    const coOrganizers = await EventClub.find({ event_id: eventId }).populate('club_id');
    const registrations = await EventRegistration.find({ event_id: eventId }).populate('student_id');
    const slots = await EventSlot.find({ event_id: eventId });

    return {
      event,
      coOrganizers,
      registrations,
      slots,
      availableSlots: slots.filter((s) => !s.allocated).length,
    };
  } catch (error) {
    console.error('Error fetching event details:', error);
    return null;
  }
}

/**
 * Create team for team-based event
 */
export async function createTeam(
  eventId: string,
  teamName: string,
  leaderStudentId: string
): Promise<ITeam | null> {
  try {
    await connectDB();

    // Check if event is team-based
    const event = await Event.findById(eventId);
    if (!event || event.event_type !== 'TEAM') {
      throw new Error('Event does not support teams');
    }

    // Check if leader already has a team for this event
    const existingTeam = await Team.findOne({
      event_id: eventId,
      team_leader_id: leaderStudentId,
    });

    if (existingTeam) {
      throw new Error('Leader already has a team for this event');
    }

    const team = await Team.create({
      event_id: eventId,
      team_name: teamName,
      team_leader_id: leaderStudentId,
    });

    // Add leader as team member
    await TeamMember.create({
      team_id: team._id,
      student_id: leaderStudentId,
    });

    return team;
  } catch (error) {
    console.error('Error creating team:', error);
    return null;
  }
}

/**
 * Add member to team
 */
export async function addTeamMember(teamId: string, studentId: string) {
  try {
    await connectDB();

    // Check if member already exists
    const existing = await TeamMember.findOne({
      team_id: teamId,
      student_id: studentId,
    });

    if (existing) {
      throw new Error('Student is already a team member');
    }

    const member = await TeamMember.create({
      team_id: teamId,
      student_id: studentId,
    });

    return member;
  } catch (error) {
    console.error('Error adding team member:', error);
    return null;
  }
}
