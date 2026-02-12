import connectDB from '@/lib/db';
import Student from '@/models/Student';
import { verifyPassword, hashPassword } from '@/lib/auth-utils';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    await connectDB();
    const { id, currentPassword, newPassword } = await request.json();

    if (!id || !currentPassword || !newPassword) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: 'New password must be at least 6 characters' },
        { status: 400 }
      );
    }

    // Verify current password
    const student = await Student.findById(id);
    if (!student) {
      return NextResponse.json(
        { error: 'Student not found' },
        { status: 404 }
      );
    }

    const isPasswordValid = await verifyPassword(currentPassword, student.password_hash);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Current password is incorrect' },
        { status: 401 }
      );
    }

    // Hash new password and update
    const newPasswordHash = await hashPassword(newPassword);
    const updatedStudent = await Student.findByIdAndUpdate(
      id,
      { password_hash: newPasswordHash },
      { new: true }
    ).select('-password_hash');

    return NextResponse.json(
      {
        message: 'Password changed successfully',
        student: updatedStudent,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Change password error:', error);
    return NextResponse.json(
      { error: (error as Error).message || 'Failed to change password' },
      { status: 500 }
    );
  }
}
