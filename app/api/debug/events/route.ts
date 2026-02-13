import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { Event } from '@/models';

export async function GET() {
  try {
    await connectDB();

    // Get all events without any filter
    const allEvents = await Event.find({}).lean();

    console.log('=== DATABASE DEBUG ===');
    console.log('Total events in database:', allEvents.length);
    
    if (allEvents.length > 0) {
      allEvents.forEach((event: any, index: number) => {
        console.log(`\nEvent ${index + 1}:`);
        console.log('  _id:', event._id.toString());
        console.log('  primary_club_id:', event.primary_club_id.toString());
        console.log('  title:', event.title);
        console.log('  status:', event.status);
        console.log('  date:', event.date);
        console.log('  end_date:', event.end_date);
      });
    }

    return NextResponse.json({
      totalEvents: allEvents.length,
      events: allEvents.map((event: any) => ({
        _id: event._id.toString(),
        primary_club_id: event.primary_club_id?.toString(),
        title: event.title,
        event_type: event.event_type,
        status: event.status,
        date: event.date,
        end_date: event.end_date,
        created_at: event.created_at,
      })),
    });
  } catch (error) {
    console.error('Debug error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
