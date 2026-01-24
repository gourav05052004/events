/**
 * API ROUTE PATTERNS - Quick Reference
 * Use these patterns for your API routes in app/api/
 */

import connectDB from '@/lib/db';
import { 
  Admin, 
  Club, 
  Student, 
  Resource, 
  Event, 
  EventRegistration,
  ActivityLog
} from '@/models';

// ============================================
// PATTERN 1: GET - Fetch Resources
// ============================================
// app/api/events/route.ts
export async function GET(request: Request) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    
    const events = await Event.find(
      status ? { status } : {}
    ).populate('primary_club_id');
    
    return Response.json(events);
  } catch (error) {
    return Response.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}

// ============================================
// PATTERN 2: POST - Create Resource
// ============================================
// app/api/events/route.ts
export async function POST(request: Request) {
  try {
    await connectDB();
    const body = await request.json();
    
    // Validate body here with Zod
    
    const event = await Event.create(body);
    
    // Log activity
    await ActivityLog.create({
      actor_type: 'CLUB',
      actor_id: body.clubId,
      action: 'Created event',
      target_event_id: event._id,
    });
    
    return Response.json(event, { status: 201 });
  } catch (error) {
    return Response.json(
      { error: (error as Error).message },
      { status: 400 }
    );
  }
}

// ============================================
// PATTERN 3: GET [ID] - Fetch Single Resource
// ============================================
// app/api/events/[id]/route.ts
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    
    const event = await Event.findById(params.id)
      .populate('primary_club_id')
      .populate('allocated_resource_id');
    
    if (!event) {
      return Response.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }
    
    return Response.json(event);
  } catch (error) {
    return Response.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}

// ============================================
// PATTERN 4: PUT [ID] - Update Resource
// ============================================
// app/api/events/[id]/route.ts
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const body = await request.json();
    
    // Check if exists
    const existing = await Event.findById(params.id);
    if (!existing) {
      return Response.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }
    
    const updated = await Event.findByIdAndUpdate(
      params.id,
      { ...body, updated_at: new Date() },
      { new: true }
    );
    
    return Response.json(updated);
  } catch (error) {
    return Response.json(
      { error: (error as Error).message },
      { status: 400 }
    );
  }
}

// ============================================
// PATTERN 5: DELETE [ID] - Delete Resource
// ============================================
// app/api/events/[id]/route.ts
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    
    const deleted = await Event.findByIdAndDelete(params.id);
    
    if (!deleted) {
      return Response.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }
    
    return Response.json(
      { message: 'Event deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    return Response.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}

// ============================================
// PATTERN 6: Batch Operations
// ============================================
// app/api/events/[id]/register/route.ts
import { registerStudentForEvent } from '@/lib/db-helpers';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    
    const registration = await registerStudentForEvent(
      params.id,
      body.studentId
    );
    
    return Response.json(registration, { status: 201 });
  } catch (error) {
    return Response.json(
      { error: (error as Error).message },
      { status: 400 }
    );
  }
}

// ============================================
// COMMON DIRECTORY STRUCTURE
// ============================================
/*
app/
  api/
    admins/
      route.ts              (GET all, POST create)
      [id]/
        route.ts            (GET, PUT, DELETE)
        approve-event/
          route.ts          (POST)
    
    clubs/
      route.ts
      [id]/
        route.ts
        events/
          route.ts          (POST create event)
    
    students/
      route.ts
      [id]/
        route.ts
        registrations/
          route.ts          (GET my registrations)
    
    events/
      route.ts              (GET all, POST create)
      [id]/
        route.ts
        register/
          route.ts          (POST)
        cancel/
          route.ts          (POST)
        allocate-venue/
          route.ts          (POST - admin only)
    
    resources/
      route.ts
      [id]/
        route.ts
    
    teams/
      [id]/
        members/
          route.ts          (POST add member)
    
    activity-logs/
      route.ts              (GET logs - admin only)
*/

// ============================================
// MIDDLEWARE EXAMPLE
// ============================================
/*
// lib/auth.ts
import { jwtVerify } from 'jose';

const secret = new TextEncoder().encode(process.env.JWT_SECRET!);

export async function verifyAuth(request: Request) {
  const token = request.headers.get('Authorization')?.split(' ')[1];
  
  if (!token) {
    throw new Error('No token provided');
  }
  
  const verified = await jwtVerify(token, secret);
  return verified.payload;
}

// Usage in API route:
// const user = await verifyAuth(request);
// if (user.role !== 'ADMIN') {
//   return Response.json({ error: 'Unauthorized' }, { status: 403 });
// }
*/
