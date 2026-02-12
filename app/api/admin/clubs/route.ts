import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { Club } from '@/models';
import bcrypt from 'bcryptjs';

/**
 * GET /api/admin/clubs
 * Fetch all clubs (admin only)
 */
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const clubs = await Club.find().select('-password_hash').lean();
    
    return NextResponse.json({
      success: true,
      data: clubs,
      count: clubs.length,
    });
  } catch (error) {
    console.error('Error fetching clubs:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch clubs' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/clubs
 * Create a new club (admin only)
 */
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const body = await request.json();
    const { club_name, email, password, faculty_coordinator_name, description } = body;

    // Validation
    if (!club_name || !email || !password || !faculty_coordinator_name) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if club already exists
    const existingClub = await Club.findOne({ email: email.toLowerCase() });
    if (existingClub) {
      return NextResponse.json(
        { success: false, error: 'Club with this email already exists' },
        { status: 409 }
      );
    }

    // Hash password
    const password_hash = await bcrypt.hash(password, 10);

    // Create club
    const newClub = await Club.create({
      club_name,
      email: email.toLowerCase(),
      password_hash,
      faculty_coordinator_name,
      description: description || '',
      is_active: true,
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Club created successfully',
        data: {
          _id: newClub._id,
          club_name: newClub.club_name,
          email: newClub.email,
          faculty_coordinator_name: newClub.faculty_coordinator_name,
          description: newClub.description,
          is_active: newClub.is_active,
          created_at: newClub.created_at,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating club:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create club' },
      { status: 500 }
    );
  }
}
