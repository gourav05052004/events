import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/middleware';
import connectDB from '@/lib/db';
import EventRegistration from '@/models/EventRegistration';

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const payload = requireAuth(request);
    if (payload instanceof NextResponse) {
      return payload;
    }

    const studentId = payload.id;

    // Connect to database
    await connectDB();

    // Convert student ID to ObjectId for MongoDB queries
    const { ObjectId } = require('mongoose').Types;
    const objectStudentId = new ObjectId(studentId);
    
    console.log('🔍 Registrations Fetch Request:');
    console.log('  studentId (from token):', studentId);
    console.log('  objectStudentId (converted):', objectStudentId.toString());

    // Fetch all registrations for this student
    // Try both ObjectId and string formats in case of data inconsistency
    const registrations = await EventRegistration.find({
      $or: [
        { student_id: objectStudentId },  // Try ObjectId match
        { student_id: studentId },         // Try string match (backward compatibility)
      ]
    })
      .populate('event_id')
      .sort({ registered_at: -1 });
    
    console.log('📊 Query Result:');
    console.log('  Found registrations:', registrations.length);
    if (registrations.length > 0) {
      console.log('  First registration:', registrations[0]);
    }

    return NextResponse.json(
      {
        success: true,
        registrations: registrations.map((reg: any) => {
          // Handle both populated and non-populated event_id
          const event = reg.event_id;
          const eventData = event._id ? event : null;
          
          return {
            _id: reg._id,
            event_id: eventData?._id || event,
            event: eventData ? {
              _id: eventData._id,
              title: eventData.title,
              date: eventData.date,
              end_date: eventData.end_date,
              start_time: eventData.start_time,
              end_time: eventData.end_time,
              location: eventData.location,
              poster_url: eventData.poster_url,
              registrations: eventData.registrations,
              max_participants: eventData.max_participants,
            } : null,
            student_id: reg.student_id,
            status: reg.status,
            registered_at: reg.registered_at,
          };
        }),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Fetch registrations error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch registrations' },
      { status: 500 }
    );
  }
}
