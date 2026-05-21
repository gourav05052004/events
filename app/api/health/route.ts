import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '@/lib/db';

export async function GET(request: Request) {
  try {
    // Optional security check
    const secretHeader = request.headers.get('x-health-secret');
    const secret = process.env.HEALTH_SECRET;
    
    if (secret && secretHeader !== secret) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    // Ping MongoDB to confirm it's alive
    if (mongoose.connection.db) {
      await mongoose.connection.db.admin().ping();
    } else {
      throw new Error('Database connection established but db instance is missing');
    }

    return NextResponse.json(
      {
        status: 'ok',
        mongodb: 'connected',
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Health check failed:', error);
    return NextResponse.json(
      {
        status: 'error',
        mongodb: 'disconnected',
        message: error.message || 'Unknown error',
      },
      { status: 500 }
    );
  }
}
