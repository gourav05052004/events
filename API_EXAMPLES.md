# 📌 Complete API Implementation Examples

## 1. Admin Login API

```typescript
// app/api/auth/admin-login/route.ts
import { compare } from 'bcrypt';
import connectDB from '@/lib/db';
import { Admin } from '@/models';

export async function POST(request: Request) {
  try {
    await connectDB();
    const { email, password } = await request.json();

    // Validate input
    if (!email || !password) {
      return Response.json(
        { error: 'Email and password required' },
        { status: 400 }
      );
    }

    // Find admin
    const admin = await Admin.findOne({ email: email.toLowerCase() });
    if (!admin) {
      return Response.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Verify password
    const isValid = await compare(password, admin.password_hash);
    if (!isValid) {
      return Response.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Generate JWT token (implement with jsonwebtoken)
    const token = generateToken({ id: admin._id, role: 'admin' });

    return Response.json({
      token,
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
      },
    });
  } catch (error) {
    return Response.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
```

## 2. Create Event API

```typescript
// app/api/events/route.ts
import connectDB from '@/lib/db';
import { Event, Club } from '@/models';
import { createEventWithSlots, logActivity } from '@/lib/db-helpers';

export async function POST(request: Request) {
  try {
    await connectDB();
    const body = await request.json();
    const clubId = request.headers.get('X-Club-ID');

    if (!clubId) {
      return Response.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Verify club exists and is active
    const club = await Club.findById(clubId);
    if (!club || !club.is_active) {
      return Response.json(
        { error: 'Club not found or inactive' },
        { status: 404 }
      );
    }

    // Create event with slots
    const event = await createEventWithSlots({
      primary_club_id: clubId,
      title: body.title,
      description: body.description,
      event_type: body.event_type,
      poster_url: body.poster_url,
      requested_resource_type: body.requested_resource_type,
      date: new Date(body.date),
      start_time: body.start_time,
      end_time: body.end_time,
      min_participants: body.min_participants,
      max_participants: body.max_participants,
      registration_deadline: new Date(body.registration_deadline),
      status: 'PENDING',
    });

    // Log activity
    await logActivity('CLUB', clubId, 'Created event', event._id.toString());

    return Response.json(event, { status: 201 });
  } catch (error) {
    return Response.json(
      { error: (error as Error).message },
      { status: 400 }
    );
  }
}
```

## 3. Register Student for Event API

```typescript
// app/api/events/[id]/register/route.ts
import connectDB from '@/lib/db';
import { registerStudentForEvent, logActivity } from '@/lib/db-helpers';
import { Event } from '@/models';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const { studentId } = await request.json();

    // Verify event exists
    const event = await Event.findById(params.id);
    if (!event) {
      return Response.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    // Check registration deadline
    if (new Date() > event.registration_deadline) {
      return Response.json(
        { error: 'Registration deadline passed' },
        { status: 400 }
      );
    }

    // Check event status
    if (event.status !== 'APPROVED') {
      return Response.json(
        { error: 'Event not yet approved' },
        { status: 400 }
      );
    }

    // Register student
    const registration = await registerStudentForEvent(
      params.id,
      studentId
    );

    if (!registration) {
      return Response.json(
        { error: 'Registration failed' },
        { status: 400 }
      );
    }

    // Log activity
    await logActivity(
      'CLUB',
      event.primary_club_id.toString(),
      `Student registered: ${registration.status}`,
      params.id
    );

    return Response.json(registration, { status: 201 });
  } catch (error) {
    return Response.json(
      { error: (error as Error).message },
      { status: 400 }
    );
  }
}
```

## 4. Admin Approves Event & Allocates Venue

```typescript
// app/api/admin/events/[id]/approve/route.ts
import connectDB from '@/lib/db';
import { Event, Resource } from '@/models';
import { logActivity } from '@/lib/db-helpers';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const { adminId, resourceId } = await request.json();

    // Verify event exists
    const event = await Event.findById(params.id);
    if (!event) {
      return Response.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    // Verify resource exists and matches requested type
    const resource = await Resource.findById(resourceId);
    if (!resource || resource.type !== event.requested_resource_type) {
      return Response.json(
        { error: 'Invalid resource' },
        { status: 400 }
      );
    }

    // Check resource capacity
    if (resource.capacity < event.max_participants) {
      return Response.json(
        { error: `Resource capacity (${resource.capacity}) less than event max (${event.max_participants})` },
        { status: 400 }
      );
    }

    // Update event
    const updated = await Event.findByIdAndUpdate(
      params.id,
      {
        status: 'APPROVED',
        allocated_resource_id: resourceId,
      },
      { new: true }
    );

    // Log activity
    await logActivity(
      'ADMIN',
      adminId,
      `Approved event and allocated ${resource.name}`,
      params.id
    );

    return Response.json(updated);
  } catch (error) {
    return Response.json(
      { error: (error as Error).message },
      { status: 400 }
    );
  }
}
```

## 5. Get Event Details with Registrations

```typescript
// app/api/events/[id]/details/route.ts
import connectDB from '@/lib/db';
import { getEventWithDetails } from '@/lib/db-helpers';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const details = await getEventWithDetails(params.id);

    if (!details) {
      return Response.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    return Response.json({
      event: details.event,
      coOrganizers: details.coOrganizers,
      totalRegistrations: details.registrations.length,
      confirmedCount: details.registrations.filter(
        (r) => r.status === 'CONFIRMED'
      ).length,
      waitlistedCount: details.registrations.filter(
        (r) => r.status === 'WAITLISTED'
      ).length,
      availableSlots: details.availableSlots,
      students: details.registrations.map((r) => ({
        id: r.student_id._id,
        name: r.student_id.name,
        status: r.status,
        registeredAt: r.registered_at,
      })),
    });
  } catch (error) {
    return Response.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
```

## 6. Create Team for Team Event

```typescript
// app/api/teams/route.ts
import connectDB from '@/lib/db';
import { createTeam, logActivity } from '@/lib/db-helpers';
import { Event } from '@/models';

export async function POST(request: Request) {
  try {
    await connectDB();
    const { eventId, teamName, leaderStudentId, clubId } = await request.json();

    // Verify event exists and is team-based
    const event = await Event.findById(eventId);
    if (!event) {
      return Response.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    if (event.event_type !== 'TEAM') {
      return Response.json(
        { error: 'Event does not support teams' },
        { status: 400 }
      );
    }

    // Create team
    const team = await createTeam(eventId, teamName, leaderStudentId);

    if (!team) {
      return Response.json(
        { error: 'Failed to create team' },
        { status: 400 }
      );
    }

    // Log activity
    await logActivity('CLUB', clubId, `Created team: ${teamName}`, eventId);

    return Response.json(team, { status: 201 });
  } catch (error) {
    return Response.json(
      { error: (error as Error).message },
      { status: 400 }
    );
  }
}
```

## 7. Get All Events with Filters

```typescript
// app/api/events/route.ts (GET method)
import connectDB from '@/lib/db';
import { Event } from '@/models';

export async function GET(request: Request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const clubId = searchParams.get('clubId');
    const eventType = searchParams.get('eventType');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    // Build query
    const query: any = {};
    if (status) query.status = status;
    if (clubId) query.primary_club_id = clubId;
    if (eventType) query.event_type = eventType;

    // Pagination
    const skip = (page - 1) * limit;

    const events = await Event.find(query)
      .populate('primary_club_id')
      .populate('allocated_resource_id')
      .sort({ date: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Event.countDocuments(query);

    return Response.json({
      events,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return Response.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
```

## 8. Get Activity Logs

```typescript
// app/api/admin/activity-logs/route.ts
import connectDB from '@/lib/db';
import { ActivityLog } from '@/models';

export async function GET(request: Request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const actorType = searchParams.get('actorType');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');

    const query: any = {};
    if (actorType) query.actor_type = actorType;

    const skip = (page - 1) * limit;

    const logs = await ActivityLog.find(query)
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(limit);

    const total = await ActivityLog.countDocuments(query);

    return Response.json({
      logs,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return Response.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
```

## 9. Add Member to Team

```typescript
// app/api/teams/[id]/members/route.ts
import connectDB from '@/lib/db';
import { addTeamMember } from '@/lib/db-helpers';
import { Team } from '@/models';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const { studentId } = await request.json();

    // Verify team exists
    const team = await Team.findById(params.id);
    if (!team) {
      return Response.json(
        { error: 'Team not found' },
        { status: 404 }
      );
    }

    // Add member
    const member = await addTeamMember(params.id, studentId);

    if (!member) {
      return Response.json(
        { error: 'Failed to add team member' },
        { status: 400 }
      );
    }

    return Response.json(member, { status: 201 });
  } catch (error) {
    return Response.json(
      { error: (error as Error).message },
      { status: 400 }
    );
  }
}
```

## 10. Cancel Event

```typescript
// app/api/events/[id]/cancel/route.ts
import connectDB from '@/lib/db';
import { Event, EventRegistration } from '@/models';
import { logActivity } from '@/lib/db-helpers';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const { adminId, reason } = await request.json();

    // Verify event exists
    const event = await Event.findById(params.id);
    if (!event) {
      return Response.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    // Update event status
    const updated = await Event.findByIdAndUpdate(
      params.id,
      { status: 'CANCELLED' },
      { new: true }
    );

    // Log activity
    await logActivity('ADMIN', adminId, `Cancelled event: ${reason}`, params.id);

    return Response.json(updated);
  } catch (error) {
    return Response.json(
      { error: (error as Error).message },
      { status: 400 }
    );
  }
}
```

---

**Note**: These examples show best practices for:
- ✅ Input validation
- ✅ Error handling
- ✅ Database connections
- ✅ Activity logging
- ✅ Pagination
- ✅ Filtering
- ✅ Proper HTTP status codes

Replace `generateToken()` and authentication checks with your actual implementation.
