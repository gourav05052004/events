import connectDB from '@/lib/db';
import { verifyToken } from '@/lib/jwt-utils';
import { cookies } from 'next/headers';
import Admin from '@/models/Admin';

export async function GET(req: Request) {
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

    await connectDB();
    const admin = await Admin.findById(decoded.adminId).select('name email');

    if (!admin) {
      return Response.json(
        { error: 'Admin not found' },
        { status: 404 }
      );
    }

    return Response.json({
      name: admin.name,
      email: admin.email,
    });
  } catch (error) {
    console.error('Error fetching admin profile:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
