import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { Club } from '@/models';
import bcrypt from 'bcryptjs';

/**
 * GET /api/club/settings
 * Fetch club settings
 */
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const clubId = request.nextUrl.searchParams.get('clubId');
    
    if (!clubId) {
      return NextResponse.json(
        { error: 'Club ID is required' },
        { status: 400 }
      );
    }

    const club = await Club.findById(clubId)
      .select('club_name email faculty_coordinator_name faculty_coordinator_department description')
      .lean() as any;

    if (!club) {
      return NextResponse.json(
        { error: 'Club not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        clubName: club.club_name || '',
        email: club.email || '',
        facultyCoordinator: club.faculty_coordinator_name || '',
        department: club.faculty_coordinator_department || '',
        description: club.description || '',
      },
    });
  } catch (error) {
    console.error('[GET /api/club/settings] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch club settings' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/club/settings
 * Update club settings (profile or password)
 */
export async function PUT(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const { clubId, type, ...data } = body;

    if (!clubId) {
      return NextResponse.json(
        { error: 'Club ID is required' },
        { status: 400 }
      );
    }

    const club = await Club.findById(clubId);
    if (!club) {
      return NextResponse.json(
        { error: 'Club not found' },
        { status: 404 }
      );
    }

    // Handle password change
    if (type === 'password') {
      const { currentPassword, newPassword } = data;

      if (!currentPassword || !newPassword) {
        return NextResponse.json(
          { error: 'Current password and new password are required' },
          { status: 400 }
        );
      }

      // Verify current password
      const isValidPassword = await bcrypt.compare(currentPassword, club.password_hash);
      if (!isValidPassword) {
        return NextResponse.json(
          { error: 'Current password is incorrect' },
          { status: 401 }
        );
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      club.password_hash = hashedPassword;
      await club.save();

      return NextResponse.json({
        success: true,
        message: 'Password updated successfully',
      });
    }

    // Handle profile update
    if (type === 'profile') {
      const updateData: any = {};

      if (data.clubName !== undefined) updateData.club_name = data.clubName;
      if (data.email !== undefined) updateData.email = data.email;
      if (data.facultyCoordinator !== undefined) updateData.faculty_coordinator_name = data.facultyCoordinator;
      if (data.department !== undefined) updateData.faculty_coordinator_department = data.department;
      if (data.description !== undefined) updateData.description = data.description;

      const updatedClub = await Club.findByIdAndUpdate(
        clubId,
        { $set: updateData },
        { new: true, runValidators: true }
      ).select('club_name email faculty_coordinator_name faculty_coordinator_department description');

      if (!updatedClub) {
        return NextResponse.json(
          { error: 'Failed to update club' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        message: 'Profile updated successfully',
        data: {
          clubName: updatedClub.club_name,
          email: updatedClub.email,
          facultyCoordinator: updatedClub.faculty_coordinator_name,
          department: updatedClub.faculty_coordinator_department,
          description: updatedClub.description,
        },
      });
    }

    return NextResponse.json(
      { error: 'Invalid update type' },
      { status: 400 }
    );
  } catch (error) {
    console.error('[PUT /api/club/settings] Error:', error);
    return NextResponse.json(
      { error: 'Failed to update club settings' },
      { status: 500 }
    );
  }
}
