import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { verifyPassword, hashPassword } from '@/lib/auth-utils';
import Club from '@/models/Club';
import mongoose from 'mongoose';

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    // Authenticate club using cookie set on login (same pattern as other club routes)
    const clubToken = request.cookies.get('club_token')?.value || '';
    if (!clubToken || !mongoose.Types.ObjectId.isValid(clubToken)) {
      return NextResponse.json({ error: 'Invalid token — club ID missing or invalid' }, { status: 401 });
    }

    const clubId = clubToken;

    const body = await request.json();
    const { currentPassword, newPassword, confirmPassword } = body || {};

    if (!currentPassword || !newPassword || !confirmPassword) {
      return Response.json({ error: 'All fields are required' }, { status: 400 });
    }

    if (newPassword !== confirmPassword) {
      return Response.json({ error: 'New passwords do not match' }, { status: 400 });
    }

    if (newPassword.length < 8) {
      return Response.json({ error: 'Password must be at least 8 characters' }, { status: 400 });
    }

    if (newPassword === currentPassword) {
      return Response.json({ error: 'New password must be different from current password' }, { status: 400 });
    }

    // Find club by ID
    const club = await Club.findById(clubId);
    if (!club) {
      return NextResponse.json({ error: `No club found with ID: ${clubId}` }, { status: 404 });
    }

    const isMatch = await verifyPassword(currentPassword, (club as any).password_hash);
    if (!isMatch) {
      return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 });
    }

    const hashed = await hashPassword(newPassword);
    await Club.findByIdAndUpdate(clubId, { password_hash: hashed });

    return NextResponse.json({ success: true, message: 'Password updated successfully' }, { status: 200 });
  } catch (error) {
    console.error('Change club password error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
