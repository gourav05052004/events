import connectDB from '@/lib/db';
import Student from '@/models/Student';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    await connectDB();
    const { id, name, email, department, batch } = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: 'Student ID is required' },
        { status: 400 }
      );
    }

    if (!name || !email || !department || !batch) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Check if email is already used by another student
    const existingStudent = await Student.findOne({ 
      email: email.toLowerCase(),
      _id: { $ne: id }
    });

    if (existingStudent) {
      return NextResponse.json(
        { error: 'Email already in use' },
        { status: 409 }
      );
    }

    const student = await Student.findByIdAndUpdate(
      id,
      {
        name: name.trim(),
        email: email.toLowerCase().trim(),
        department,
        batch,
      },
      { new: true, runValidators: true }
    ).select('-password_hash');

    if (!student) {
      return NextResponse.json(
        { error: 'Student not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        message: 'Profile updated successfully',
        student,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json(
      { error: (error as Error).message || 'Failed to update profile' },
      { status: 500 }
    );
  }
}
