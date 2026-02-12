import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { Event, Club } from '@/models';
import mongoose from 'mongoose';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const clubId = request.nextUrl.searchParams.get('clubId');
    console.log('[GET /api/club/dashboard] Requested clubId:', clubId);
    
    if (!clubId || !mongoose.Types.ObjectId.isValid(clubId)) {
      console.error('[GET /api/club/dashboard] Invalid clubId:', clubId);
      return NextResponse.json({ error: 'Valid club ID required' }, { status: 400 });
    }

    // Fetch club info
    const club = await Club.findById(clubId).lean();
    if (!club) {
      return NextResponse.json({ error: 'Club not found' }, { status: 404 });
    }

    // Fetch all events for this club
    const allEvents = await Event.find({ 
      primary_club_id: new mongoose.Types.ObjectId(clubId) 
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
