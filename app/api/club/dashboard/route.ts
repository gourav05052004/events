import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { Event, Club } from '@/models';
import mongoose from 'mongoose';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const clubId = request.nextUrl.searchParams.get('clubId');
    const yearStart = request.nextUrl.searchParams.get('yearStart');
    const yearEnd = request.nextUrl.searchParams.get('yearEnd');

    const dateFilter =
      yearStart && yearEnd
        ? { date: { $gte: new Date(yearStart), $lte: new Date(yearEnd) } }
        : {};
    console.log('[GET /api/club/dashboard] Requested clubId:', clubId);
    
    if (!clubId || !mongoose.Types.ObjectId.isValid(clubId)) {
      console.error('[GET /api/club/dashboard] Invalid clubId:', clubId);
      return NextResponse.json({ error: 'Valid club ID required' }, { status: 400 });
    }

    // Fetch club info
    const club = await Club.findById(clubId).lean() as any;
    if (!club) {
      return NextResponse.json({ error: 'Club not found' }, { status: 404 });
    }

    console.log('[GET /api/club/dashboard] Club data retrieved:', {
      _id: club._id,
      club_name: club.club_name,
      logo: club.logo || 'NO LOGO IN DATABASE',
      hasLogoField: 'logo' in club,
      brand_color: club.brand_color || 'DEFAULT',
    });

    // Fetch all events for this club
    const allEvents = await Event.find({ 
      primary_club_id: new mongoose.Types.ObjectId(clubId),
      ...dateFilter,
    }).lean();

    // Calculate stats
    const activeEvents = allEvents.filter(
      (e: any) => e.status === 'APPROVED' && new Date(e.date) >= new Date()
    ).length;

    const completedEvents = allEvents.filter(
      (e: any) => e.status === 'APPROVED' && new Date(e.date) < new Date()
    ).length;

    // Total registrations - we'll set to 0 for now since we don't have registration data yet
    const totalRegistrations = 0;

    // Calculate average attendance (capacity fill rate)
    const totalCapacity = allEvents.reduce((sum: number, e: any) => sum + (e.max_participants || 0), 0);
    const avgAttendance = totalCapacity === 0 ? 0 : Math.round((totalRegistrations / totalCapacity) * 100);

    console.log('[GET /api/club/dashboard] Stats calculated:', {
      activeEvents,
      totalRegistrations,
      completedEvents,
      avgAttendance,
    });

    return NextResponse.json({
      clubName: club.club_name,
      clubDescription: club.description,
      clubLogo: club.logo,
      brandColor: club.brand_color || '#8B1E26',
      facultyCoordinator: club.faculty_coordinator_name,
      stats: {
        activeEvents,
        totalRegistrations,
        completedEvents,
        avgAttendance,
      },
    });
  } catch (error) {
    console.error('[GET /api/club/dashboard] Error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
