import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '@/lib/db';
import { Club } from '@/models';

export async function GET(request: NextRequest) {
  try {
    const clubToken = request.cookies.get('club_token')?.value || '';

    if (!clubToken || !mongoose.Types.ObjectId.isValid(clubToken)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();
    const club = await Club.findById(clubToken)
      .select('club_name email logo brand_color description faculty_coordinator_name')
      .lean<{
        _id: mongoose.Types.ObjectId;
        club_name?: string;
        email?: string;
        logo?: string;
        brand_color?: string;
        description?: string;
        faculty_coordinator_name?: string;
      }>();

    if (!club) {
      return NextResponse.json(
        { error: 'Club not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        club: {
          id: club._id,
          name: club.club_name,
          email: club.email,
          logo: club.logo || '',
          brandColor: club.brand_color || '#8B1E26',
          description: club.description || '',
          facultyCoordinator: club.faculty_coordinator_name || '',
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Failed to resolve club identity:', error);
    return NextResponse.json(
      { error: 'Failed to resolve club identity' },
      { status: 500 }
    );
  }
}
