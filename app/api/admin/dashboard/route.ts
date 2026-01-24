import { NextRequest, NextResponse } from 'next/server';
import { verifyRequestToken } from '@/lib/middleware';
import connectDB from '@/lib/db';
import { Event } from '@/models';

/**
 * GET /api/admin/dashboard
 * Protected route - requires valid JWT token
 * Returns admin dashboard data
 */
export async function GET(request: NextRequest) {
  try {
    // Verify JWT token
    const payload = verifyRequestToken(request);
    if (!payload) {
      return NextResponse.json(
        { error: 'Unauthorized - Valid token required' },
        { status: 401 }
      );
    }

    // Connect to database
    await connectDB();

    // Get dashboard statistics
    const totalEvents = await Event.countDocuments();
    const totalRegistrations = await Event.aggregate([
      {
        $group: {
          _id: null,
          totalRegistrations: {
            $sum: { $size: { $ifNull: ['$registered_students', []] } },
          },
        },
      },
    ]);

    const eventStats = await Event.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    return NextResponse.json(
      {
        message: 'Admin dashboard data',
        admin: {
          id: payload.adminId,
          email: payload.email,
          name: payload.name,
        },
        statistics: {
          totalEvents,
          totalRegistrations: totalRegistrations[0]?.totalRegistrations || 0,
          eventsByStatus: eventStats,
        },
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Dashboard error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}
