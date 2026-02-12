import connectDB from '@/lib/db';
import Student from '@/models/Student';
import { verifyPassword } from '@/lib/auth-utils';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    await connectDB();
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    const student = await Student.findOne({ email: email.toLowerCase() });
    if (!student) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    const isPasswordValid = await verifyPassword(password, student.password_hash);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    const response = NextResponse.json(
      {
        message: 'Login successful',
        student: {
          id: student._id,
          name: student.name,
          email: student.email,
          roll_number: student.roll_number,
          department: student.department,
        },
      },
      { status: 200 }
    );

    response.cookies.set('student_token', student._id.toString(), {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Student login error:', error);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
