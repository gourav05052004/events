import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '@/lib/db';
import { EventRegistration, Event } from '@/models';

export async function GET(request: NextRequest, { params }: { params: Promise<{ eventId: string }> }) {
  try {
    await connectDB();

    const { eventId } = await params;
    if (!eventId || !mongoose.Types.ObjectId.isValid(eventId)) {
      return NextResponse.json({ error: 'Invalid event ID' }, { status: 400 });
    }

    // Authenticate club using cookie set on login
    const clubToken = request.cookies.get('club_token')?.value || '';
    if (!clubToken || !mongoose.Types.ObjectId.isValid(clubToken)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const clubObjectId = new mongoose.Types.ObjectId(clubToken);

    const event = await Event.findOne({ _id: eventId, primary_club_id: clubObjectId }).lean();
    if (!event) {
      return NextResponse.json({ error: 'Event not found or unauthorized' }, { status: 404 });
    }

    const registrations = await EventRegistration.find({ event_id: new mongoose.Types.ObjectId(eventId) })
      .populate('student_id', 'name email')
      .sort({ registered_at: -1 })
      .lean();

    const formatted = registrations.map((r: any) => ({
      id: r._id.toString(),
      studentName: r.student_id?.name || 'Unknown',
      email: r.student_id?.email || '',
      registeredAt: r.registered_at,
      status: r.status || '',
    }));

    return NextResponse.json({ registrations: formatted }, { status: 200 });
  } catch (error) {
    console.error('[GET /api/club/events/[eventId]/registrations] Error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
