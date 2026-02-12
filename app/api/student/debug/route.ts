import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/middleware';
import connectDB from '@/lib/db';
import EventRegistration from '@/models/EventRegistration';
import Student from '@/models/Student';

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const payload = requireAuth(request);
    if (payload instanceof NextResponse) {
      return payload;
    }

    await connectDB();

    const studentId = payload.id;
    console.log('🔍 Debug Info:');
    console.log('  studentId from token:', studentId);
    console.log('  studentId type:', typeof studentId);

    // Convert student ID to ObjectId
    const { ObjectId } = require('mongoose').Types;
    const objectStudentId = new ObjectId(studentId);
    console.log('  objectStudentId:', objectStudentId.toString());

    // Find current student
    const currentStudent = await Student.findById(objectStudentId);
    console.log('  Current student found:', !!currentStudent);
    if (currentStudent) {
      console.log('    - Name:', currentStudent.name);
      console.log('    - Email:', currentStudent.email);
    }

    // Try to find registrations with ObjectId
    const regsWithObjectId = await EventRegistration.find({
      student_id: objectStudentId,
    });
    console.log('  Registrations with ObjectId query:', regsWithObjectId.length);

    // Try to find registrations with string
    const regsWithString = await EventRegistration.find({
      student_id: studentId,
    });
    console.log('  Registrations with String query:', regsWithString.length);

    // Get all registrations to see what student_ids exist
    const allRegs = await EventRegistration.find({}).select('student_id');
    console.log('  All student_ids in registrations:');
    const uniqueStudentIds = new Set();
    allRegs.forEach(reg => {
      uniqueStudentIds.add(reg.student_id.toString());
    });
    uniqueStudentIds.forEach(id => console.log('    -', id));

    return NextResponse.json({
      success: true,
      debug: {
        tokenStudentId: studentId,
        objectStudentId: objectStudentId.toString(),
        studentFound: !!currentStudent,
        registrationsWithObjectIdQuery: regsWithObjectId.length,
        registrationsWithStringQuery: regsWithString.length,
        allStudentIds: Array.from(uniqueStudentIds),
        allRegistrationsCount: allRegs.length,
      },
      registrations: regsWithObjectId.map((reg: any) => ({
        _id: reg._id,
        student_id: reg.student_id,
        event_id: reg.event_id,
        status: reg.status,
      })),
    });
  } catch (error) {
    console.error('Debug error:', error);
    return NextResponse.json(
      { error: 'Debug failed', details: (error as any).message },
      { status: 500 }
    );
  }
}
