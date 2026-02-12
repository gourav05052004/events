import connectDB from '@/lib/db';
import Student from '@/models/Student';
import { hashPassword } from '@/lib/auth-utils';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    await connectDB();
    const { name, email, password, roll_number, department, batch } = await request.json();

    // Validation
    if (!name || !email || !password || !roll_number || !department || !batch) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Check if student already exists by email
    const existingStudentEmail = await Student.findOne({ email: email.toLowerCase() });
    if (existingStudentEmail) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 409 }
      );
    }

    // Check if roll number already exists
    const existingStudentRoll = await Student.findOne({ roll_number });
    if (existingStudentRoll) {
      return NextResponse.json(
        { error: 'Roll number already registered' },
        { status: 409 }
      );
    }

    // Hash password
    const password_hash = await hashPassword(password);

    // Create student
    const student = await Student.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password_hash,
      roll_number: roll_number.trim(),
      department,
      batch,
    });

    return NextResponse.json(
      {
        message: 'Student registered successfully',
        student: {
          id: student._id,
          name: student.name,
          email: student.email,
          roll_number: student.roll_number,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Student registration error:', error);
    return NextResponse.json(
      { error: (error as Error).message || 'Registration failed' },
      { status: 500 }
    );
  }
}
