import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import EventRegistration from '@/models/EventRegistration';
import Student from '@/models/Student';

export async function GET() {
  try {
    await connectDB();

    // Get all registrations with populated data
    const registrations = await EventRegistration.find()
      .populate('student_id', 'email name')
      .populate('event_id', 'title')
      .sort({ registered_at: -1 })
      .limit(20);

    // Get count of registrations
    const totalCount = await EventRegistration.countDocuments();

    // Get all students
    const allStudents = await Student.find().select('_id email name');

    return NextResponse.json({
      message: 'Debug: Event Registrations',
      totalRegistrations: totalCount,
      recentRegistrations: registrations.map((reg) => ({
        id: reg._id.toString(),
        student_id: reg.student_id,
        event_id: reg.event_id,
        status: reg.status,
        registered_at: reg.registered_at,
      })),
      allStudents: allStudents.map((student) => ({
        id: student._id.toString(),
        email: student.email,
        name: student.name,
      })),
    });
  } catch (error) {
    console.error('Debug error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch debug data', details: (error as any).message },
      { status: 500 }
    );
  }
}
