import connectDB from '@/lib/db';
import { Admin } from '@/models';
import { hashPassword } from '@/lib/auth-utils';

export async function POST(request: Request) {
  try {
    await connectDB();
    const { email, password, name } = await request.json();

    // Validation
    if (!email || !password || !name) {
      return Response.json(
        { error: 'Email, password, and name are required' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return Response.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email: email.toLowerCase() });
    if (existingAdmin) {
      return Response.json(
        { error: 'Email already registered' },
        { status: 409 }
      );
    }

    // Hash password
    const password_hash = await hashPassword(password);

    // Create admin
    const admin = await Admin.create({
      name,
      email: email.toLowerCase(),
      password_hash,
    });

    return Response.json(
      {
        message: 'Admin registered successfully',
        admin: {
          id: admin._id,
          name: admin.name,
          email: admin.email,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Admin registration error:', error);
    return Response.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
