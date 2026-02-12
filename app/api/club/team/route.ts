import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { Club } from '@/models';
import { uploadToCloudinary } from '@/lib/cloudinary';

/**
 * GET /api/club/team
 * Fetch team details (faculty coordinator and president)
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
      .select('faculty_coordinator_name faculty_coordinator_email faculty_coordinator_phone faculty_coordinator_department faculty_coordinator_office faculty_coordinator_image president_name president_email president_phone president_department president_office president_image')
      .lean();

    if (!club) {
      return NextResponse.json(
        { error: 'Club not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        facultyCoordinator: {
          name: club.faculty_coordinator_name || '',
          email: club.faculty_coordinator_email || '',
          phone: club.faculty_coordinator_phone || '',
          department: club.faculty_coordinator_department || '',
          office: club.faculty_coordinator_office || '',
          image: club.faculty_coordinator_image || '',
        },
        president: {
          name: club.president_name || '',
          email: club.president_email || '',
          phone: club.president_phone || '',
          department: club.president_department || '',
          office: club.president_office || '',
          image: club.president_image || '',
        },
      },
    });
  } catch (error) {
    console.error('[GET /api/club/team] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch team details' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/club/team
 * Update team details (faculty coordinator and president) with optional image upload
 */
export async function PUT(request: NextRequest) {
  try {
    await connectDB();

    const contentType = request.headers.get('content-type') || '';
    let clubId: string;
    let memberType: string;
    let updateData: any = {};
    let imageFile: File | null = null;

    // Handle both JSON and FormData
    if (contentType.includes('multipart/form-data')) {
      // Handle image upload via FormData
      const formData = await request.formData();
      clubId = formData.get('clubId') as string;
      memberType = formData.get('memberType') as string;
      imageFile = formData.get('image') as File | null;
    } else {
      // Handle regular JSON update
      const body = await request.json();
      clubId = body.clubId;
      const { facultyCoordinator, president } = body;

      // Update faculty coordinator fields
      if (facultyCoordinator) {
        if (facultyCoordinator.name !== undefined) updateData.faculty_coordinator_name = facultyCoordinator.name;
        if (facultyCoordinator.email !== undefined) updateData.faculty_coordinator_email = facultyCoordinator.email;
        if (facultyCoordinator.phone !== undefined) updateData.faculty_coordinator_phone = facultyCoordinator.phone;
        if (facultyCoordinator.department !== undefined) updateData.faculty_coordinator_department = facultyCoordinator.department;
        if (facultyCoordinator.office !== undefined) updateData.faculty_coordinator_office = facultyCoordinator.office;
        if (facultyCoordinator.image !== undefined) updateData.faculty_coordinator_image = facultyCoordinator.image;
      }

      // Update president fields
      if (president) {
        if (president.name !== undefined) updateData.president_name = president.name;
        if (president.email !== undefined) updateData.president_email = president.email;
        if (president.phone !== undefined) updateData.president_phone = president.phone;
        if (president.department !== undefined) updateData.president_department = president.department;
        if (president.office !== undefined) updateData.president_office = president.office;
        if (president.image !== undefined) updateData.president_image = president.image;
      }
    }

    if (!clubId) {
      return NextResponse.json(
        { error: 'Club ID is required' },
        { status: 400 }
      );
    }

    // Handle image upload if present
    if (imageFile && memberType) {
      try {
        const arrayBuffer = await imageFile.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        
        const publicId = memberType === 'faculty' 
          ? `faculty-coordinator-${clubId}` 
          : `president-${clubId}`;
        
        const imageUrl = await uploadToCloudinary(buffer, publicId);
        
        if (memberType === 'faculty') {
          updateData.faculty_coordinator_image = imageUrl;
        } else if (memberType === 'president') {
          updateData.president_image = imageUrl;
        }
      } catch (uploadError) {
        console.error('[PUT /api/club/team] Image upload error:', uploadError);
        return NextResponse.json(
          { error: 'Failed to upload image', details: String(uploadError) },
          { status: 500 }
        );
      }
    }

    const updatedClub = await Club.findByIdAndUpdate(
      clubId,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select('faculty_coordinator_name faculty_coordinator_email faculty_coordinator_phone faculty_coordinator_department faculty_coordinator_office faculty_coordinator_image president_name president_email president_phone president_department president_office president_image');

    if (!updatedClub) {
      return NextResponse.json(
        { error: 'Club not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Team details updated successfully',
      data: {
        facultyCoordinator: {
          name: updatedClub.faculty_coordinator_name,
          email: updatedClub.faculty_coordinator_email,
          phone: updatedClub.faculty_coordinator_phone,
          department: updatedClub.faculty_coordinator_department,
          office: updatedClub.faculty_coordinator_office,
          image: updatedClub.faculty_coordinator_image,
        },
        president: {
          name: updatedClub.president_name,
          email: updatedClub.president_email,
          phone: updatedClub.president_phone,
          department: updatedClub.president_department,
          office: updatedClub.president_office,
          image: updatedClub.president_image,
        },
      },
    });
  } catch (error) {
    console.error('[PUT /api/club/team] Error:', error);
    return NextResponse.json(
      { error: 'Failed to update team details' },
      { status: 500 }
    );
  }
}
