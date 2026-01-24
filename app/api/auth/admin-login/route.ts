import connectDB from '@/lib/db';
import { Admin } from '@/models';
import { verifyPassword } from '@/lib/auth-utils';
import { generateToken } from '@/lib/jwt-utils';

export async function POST(request: Request) {
  try {
    await connectDB();
    const { email, password } = await request.json();

    // Validation
    if (!email || !password) {
      return Response.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Find admin
    const admin = await Admin.findOne({ email: email.toLowerCase() });
    if (!admin) {
      return Response.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Verify password
    const isPasswordValid = await verifyPassword(password, admin.password_hash);
    if (!isPasswordValid) {
      return Response.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Return success with admin data and JWT token
    const token = generateToken({
      adminId: admin._id.toString(),
      email: admin.email,
      name: admin.name,
    });

    return Response.json(
      {
        message: 'Login successful',
        token,
        admin: {
          id: admin._id,
          name: admin.name,
          email: admin.email,
          created_at: admin.created_at,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Admin login error:', error);
    return Response.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
