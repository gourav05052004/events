import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { Club } from '@/models';
import { uploadToCloudinary } from '@/lib/cloudinary';
import bcrypt from 'bcryptjs';

/**
 * GET /api/admin/clubs
 * Fetch all clubs (admin only)
 * Query params: clubId (optional - to fetch specific club)
 */
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const clubId = request.nextUrl.searchParams.get('clubId');
    
    if (clubId) {
      // Fetch specific club
      console.log('[GET /api/admin/clubs] Fetching specific club:', clubId);
      const club = await Club.findById(clubId).select('-password_hash').lean() as any;
      
      if (!club) {
        return NextResponse.json(
          { error: 'Club not found' },
          { status: 404 }
        );
      }

      console.log('[GET /api/admin/clubs] Club data retrieved:', {
        _id: club._id,
        club_name: club.club_name,
        logo: club.logo || 'NO LOGO SET',
        brand_color: club.brand_color,
      });

      return NextResponse.json({
        success: true,
        data: club,
      });
    }
    
    const clubs = await Club.find().select('-password_hash').lean();
    
    console.log('[GET /api/admin/clubs] Retrieved', clubs.length, 'clubs');
    
    return NextResponse.json({
      success: true,
      data: clubs,
      count: clubs.length,
    });
  } catch (error) {
    console.error('[GET /api/admin/clubs] Error:', error);
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

/**
 * PUT /api/admin/clubs
 * Update club logo or other details
 */
export async function PUT(request: NextRequest) {
  try {
    await connectDB();

    const formData = await request.formData();
    const clubId = formData.get('clubId') as string;
    const logo = formData.get('logo') as File | null;

    console.log('[PUT /api/admin/clubs] Request received', { clubId, hasLogo: !!logo });

    if (!clubId) {
      return NextResponse.json(
        { error: 'Club ID is required' },
        { status: 400 }
      );
    }

    // Verify club exists
    const club = await Club.findById(clubId);
    if (!club) {
      return NextResponse.json(
        { error: 'Club not found' },
        { status: 404 }
      );
    }

    console.log('[PUT /api/admin/clubs] Club found:', club._id);

    // Upload logo if provided
    let logoUrl: string | undefined;
    if (logo) {
      console.log('[PUT /api/admin/clubs] Logo file details:', { name: logo.name, size: logo.size, type: logo.type });
      try {
        const arrayBuffer = await logo.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        console.log('[PUT /api/admin/clubs] Buffer created, uploading to Cloudinary...');
        
        logoUrl = await uploadToCloudinary(buffer, `club-logo-${clubId}`);
        console.log('[PUT /api/admin/clubs] ✅ Logo uploaded to Cloudinary:', logoUrl);
      } catch (uploadError) {
        console.error('[PUT /api/admin/clubs] Logo upload error:', uploadError);
        return NextResponse.json(
          { error: 'Failed to upload logo', details: String(uploadError) },
          { status: 500 }
        );
      }
    }

    // Use findByIdAndUpdate to properly handle new fields in existing documents
    console.log('[PUT /api/admin/clubs] 💾 Updating club in database with logo:', logoUrl);
    const savedClub = await Club.findByIdAndUpdate(
      clubId,
      { 
        $set: { logo: logoUrl } 
      },
      { 
        new: true,  // Return updated document
        runValidators: true  // Run schema validators
      }
    );

    if (!savedClub) {
      return NextResponse.json(
        { error: 'Failed to update club' },
        { status: 500 }
      );
    }
    
    console.log('[PUT /api/admin/clubs] ✅ Club updated in database:', {
      clubId: savedClub._id,
      logo: savedClub.logo,
      timestamp: new Date(),
    });

    // Verify the update by fetching fresh from database
    const verifiedClub = await Club.findById(clubId).lean() as any;
    console.log('[PUT /api/admin/clubs] 🔍 Verification - Logo in database:', verifiedClub?.logo || '❌ STILL NO LOGO');

    return NextResponse.json({
      success: true,
      message: 'Club updated successfully',
      club: {
        _id: savedClub._id,
        club_name: savedClub.club_name,
        email: savedClub.email,
        faculty_coordinator_name: savedClub.faculty_coordinator_name,
        description: savedClub.description,
        logo: savedClub.logo,
        brand_color: savedClub.brand_color,
        is_active: savedClub.is_active,
      },
    });
  } catch (error) {
    console.error('[PUT /api/admin/clubs] Error:', error);
    return NextResponse.json(
      { error: 'Failed to update club', details: String(error) },
      { status: 500 }
    );
  }
}
