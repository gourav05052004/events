import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Resource from '@/models/Resource';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const { id } = await params;
    const venue = await Resource.findById(id);
    
    if (!venue) {
      return NextResponse.json({ success: false, error: 'Venue not found' }, { status: 404 });
    }
    
    return NextResponse.json({ success: true, data: venue });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch venue' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const { id } = await params;
    const body = await request.json();
    
    // If only manual_status is being updated, allow it
    if (body.manual_status) {
      const venue = await Resource.findByIdAndUpdate(
        id,
        { manual_status: body.manual_status },
        { new: true, runValidators: true }
      );
      
      if (!venue) {
        return NextResponse.json({ success: false, error: 'Venue not found' }, { status: 404 });
      }
      
      return NextResponse.json({ success: true, data: venue });
    }
    
    // Validate required fields for full update
    if (!body.name || !body.location || body.capacity === undefined) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    const venue = await Resource.findByIdAndUpdate(
      id,
      {
        name: body.name,
        location: body.location,
        capacity: body.capacity,
        type: body.type,
        amenities: body.amenities || [],
        manager: body.manager,
        contact: body.contact,
        manual_status: body.manual_status || null,
      },
      { new: true, runValidators: true }
    );
    
    if (!venue) {
      return NextResponse.json({ success: false, error: 'Venue not found' }, { status: 404 });
    }
    
    return NextResponse.json({ success: true, data: venue });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to update venue' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    
    const { id } = await params;
    const venue = await Resource.findByIdAndDelete(id);
    
    if (!venue) {
      return NextResponse.json({ success: false, error: 'Venue not found' }, { status: 404 });
    }
    
    return NextResponse.json({ success: true, data: venue });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to delete venue' }, { status: 500 });
  }
}
