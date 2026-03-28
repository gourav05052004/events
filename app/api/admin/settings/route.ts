import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { Settings } from '@/models';
import { verify } from 'jsonwebtoken';

// Verify admin authentication
async function verifyAdmin(request: NextRequest) {
  const token = request.cookies.get('admin_token')?.value;
  
  if (!token) {
    return null;
  }

  try {
    const decoded = verify(token, process.env.JWT_SECRET || 'your-secret-key');
    return decoded;
  } catch {
    return null;
  }
}

// GET - Retrieve current settings
export async function GET() {
  try {
    await connectDB();
    
    const settings = await (Settings as any).getInstance();
    
    return NextResponse.json(settings, { status: 200 });
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}

// POST - Update settings
export async function POST(request: NextRequest) {
  try {
    // Verify admin is logged in
    const admin = await verifyAdmin(request);
    if (!admin) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    const body = await request.json();
    const { platformName, platformDescription, maintenanceMode, maintenanceModeMessage } = body;

    const settings = await (Settings as any).getInstance();
    
    // Update fields
    if (platformName !== undefined) settings.platformName = platformName;
    if (platformDescription !== undefined) settings.platformDescription = platformDescription;
    if (maintenanceMode !== undefined) settings.maintenanceMode = maintenanceMode;
    if (maintenanceModeMessage !== undefined) settings.maintenanceModeMessage = maintenanceModeMessage;
    
    settings.updated_at = new Date();
    await settings.save();

    return NextResponse.json(
      { message: 'Settings updated successfully', settings },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating settings:', error);
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    );
  }
}
