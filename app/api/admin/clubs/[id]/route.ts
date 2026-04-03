import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { Club, Event, EventRegistration, Team, TeamMember } from '@/models';
import { Types } from 'mongoose';
import bcrypt from 'bcryptjs';

interface ClubLeanRecord {
  _id: Types.ObjectId;
  club_name: string;
  email: string;
  faculty_coordinator_name: string;
  faculty_coordinator_email?: string;
  faculty_coordinator_phone?: string;
  faculty_coordinator_department?: string;
  faculty_coordinator_office?: string;
  president_name?: string;
  president_email?: string;
  president_phone?: string;
  president_department?: string;
  president_office?: string;
  description?: string;
  logo?: string;
  brand_color?: string;
  is_active: boolean;
  created_at: Date;
}

interface VenueLeanRecord {
  name?: string;
  location?: string;
}

interface EventLeanRecord {
  _id: Types.ObjectId;
  title: string;
  date: Date;
  status: 'PENDING' | 'APPROVED' | 'RESCHEDULED' | 'CANCELLED';
  max_participants: number;
  allocated_resource_id?: VenueLeanRecord | null;
}

interface TeamLeanRecord {
  _id: Types.ObjectId;
  team_name: string;
  team_leader_id: Types.ObjectId;
}

interface TeamMemberLeanRecord {
  _id: Types.ObjectId;
  team_id: Types.ObjectId;
  student_id?: {
    _id: Types.ObjectId;
    name?: string;
    email?: string;
  } | null;
}

/**
 * GET /api/admin/clubs/[id]
 * Fetch a specific club by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    
    const { id } = await params;
    
    // Validate ObjectId
    if (!Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: 'Club not found' },
        { status: 404 }
      );
    }

    const club = await Club.findById(id).select('-password_hash').lean<ClubLeanRecord | null>();
    
    if (!club) {
      return NextResponse.json(
        { success: false, error: 'Club not found' },
        { status: 404 }
      );
    }

    const events = await Event.find({
      $or: [
        { primary_club_id: new Types.ObjectId(id) },
        { collaborating_clubs: new Types.ObjectId(id) },
      ],
    })
      .populate('allocated_resource_id', 'name location')
      .sort({ date: -1 })
      .lean<EventLeanRecord[]>();

    const eventsWithRegistrations = await Promise.all(
      events.map(async (event) => {
        const registrationCount = await EventRegistration.countDocuments({ event_id: event._id });

        return {
          _id: String(event._id),
          title: event.title,
          date: event.date,
          status: event.status,
          capacity: event.max_participants,
          venueName: event.allocated_resource_id?.name || 'TBD',
          venueLocation: event.allocated_resource_id?.location || '',
          registrationCount,
        };
      })
    );

    const eventIds = events.map((event) => event._id);
    let teamMembers: Array<{
      _id: string;
      name: string;
      role: string;
      email: string;
      teamName: string;
    }> = [];

    if (eventIds.length > 0) {
      const teams = await Team.find({ event_id: { $in: eventIds } }).lean<TeamLeanRecord[]>();
      const teamIds = teams.map((team) => team._id);

      if (teamIds.length > 0) {
        const teamById = new Map<string, TeamLeanRecord>();
        teams.forEach((team) => teamById.set(String(team._id), team));

        const members = await TeamMember.find({ team_id: { $in: teamIds } })
          .populate('student_id', 'name email')
          .lean<TeamMemberLeanRecord[]>();

        teamMembers = members.map((member) => {
          const team = teamById.get(String(member.team_id));
          const isLeader = team ? String(team.team_leader_id) === String(member.student_id?._id || '') : false;

          return {
            _id: String(member._id),
            name: member.student_id?.name || 'Unknown Member',
            role: isLeader ? 'Team Leader' : 'Member',
            email: member.student_id?.email || '',
            teamName: team?.team_name || 'Team',
          };
        });
      }
    }

    const summary = {
      totalEvents: eventsWithRegistrations.length,
      approvedEvents: eventsWithRegistrations.filter((event) => event.status === 'APPROVED').length,
      pendingEvents: eventsWithRegistrations.filter((event) => event.status === 'PENDING').length,
      totalRegistrations: eventsWithRegistrations.reduce(
        (sum, event) => sum + event.registrationCount,
        0
      ),
    };

    return NextResponse.json({
      success: true,
      data: {
        club: {
          _id: String(club._id),
          club_name: club.club_name,
          email: club.email,
          description: club.description || '',
          logo: club.logo || '',
          is_active: club.is_active,
          created_at: club.created_at,
          facultyCoordinator: {
            name: club.faculty_coordinator_name,
            email: club.faculty_coordinator_email || '',
            phone: club.faculty_coordinator_phone || '',
            department: club.faculty_coordinator_department || '',
            office: club.faculty_coordinator_office || '',
          },
          president: {
            name: club.president_name || '',
            email: club.president_email || '',
            phone: club.president_phone || '',
            department: club.president_department || '',
            office: club.president_office || '',
          },
        },
        events: eventsWithRegistrations,
        teamMembers,
        summary,
      },
    });
  } catch (error) {
    console.error('Error fetching club:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch club' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/clubs/[id]
 * Update a specific club
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    
    const { id } = await params;
    const body = await request.json();
    const { club_name, email, faculty_coordinator_name, description, is_active, password } = body;

    // Validate ObjectId
    if (!Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid club ID' },
        { status: 400 }
      );
    }

    const club = await Club.findById(id);
    
    if (!club) {
      return NextResponse.json(
        { success: false, error: 'Club not found' },
        { status: 404 }
      );
    }

    // Check if email is being changed and if it's unique
    if (email && email.toLowerCase() !== club.email) {
      const existingClub = await Club.findOne({ email: email.toLowerCase() });
      if (existingClub) {
        return NextResponse.json(
          { success: false, error: 'Email already in use' },
          { status: 409 }
        );
      }
    }

    // Update fields
    if (club_name) club.club_name = club_name;
    if (email) club.email = email.toLowerCase();
    if (faculty_coordinator_name) club.faculty_coordinator_name = faculty_coordinator_name;
    if (description !== undefined) club.description = description;
    if (is_active !== undefined) club.is_active = is_active;
    if (password) {
      club.password_hash = await bcrypt.hash(password, 10);
    }

    await club.save();

    return NextResponse.json({
      success: true,
      message: 'Club updated successfully',
      data: {
        _id: club._id,
        club_name: club.club_name,
        email: club.email,
        faculty_coordinator_name: club.faculty_coordinator_name,
        description: club.description,
        is_active: club.is_active,
        created_at: club.created_at,
      },
    });
  } catch (error) {
    console.error('Error updating club:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update club' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/clubs/[id]
 * Delete a specific club
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    
    const { id } = await params;

    // Validate ObjectId
    if (!Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid club ID' },
        { status: 400 }
      );
    }

    const club = await Club.findByIdAndDelete(id);
    
    if (!club) {
      return NextResponse.json(
        { success: false, error: 'Club not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Club deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting club:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete club' },
      { status: 500 }
    );
  }
}
