import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { Club } from '@/models';
import { Types } from 'mongoose';
import bcrypt from 'bcryptjs';

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
        { success: false, error: 'Invalid club ID' },
        { status: 400 }
      );
    }

    const club = await Club.findById(id).select('-password_hash').lean();
    
    if (!club) {
      return NextResponse.json(
        { success: false, error: 'Club not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: club,
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
