import connectDB from '@/lib/db';
import { verifyToken } from '@/lib/jwt-utils';
import { verifyPassword, hashPassword } from '@/lib/auth-utils';
import Admin from '@/models/Admin';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = req.headers.get('Authorization')?.split(' ')[1] || 
                  cookieStore.get('admin_token')?.value;

    if (!token) {
      return Response.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return Response.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { currentPassword, newPassword } = await req.json();

    if (!currentPassword || !newPassword) {
      return Response.json(
        { error: 'Current password and new password are required' },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return Response.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    await connectDB();
    const admin = await Admin.findById(decoded.adminId);

    if (!admin) {
      return Response.json(
        { error: 'Admin not found' },
        { status: 404 }
      );
    }

    // Verify current password
    const isCurrentPasswordValid = await verifyPassword(currentPassword, admin.password_hash);
    if (!isCurrentPasswordValid) {
      return Response.json(
        { error: 'Current password is incorrect' },
        { status: 401 }
      );
    }

    // Hash new password
    const hashedPassword = await hashPassword(newPassword);

    // Update password
    admin.password_hash = hashedPassword;
    await admin.save();

    return Response.json({
      message: 'Password changed successfully',
    });
  } catch (error) {
    console.error('Error changing password:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
