# MongoDB Integration Guide

## ✅ Setup Complete

MongoDB has been successfully integrated into your Next.js event management system with full TypeScript support.

## 📦 What's Been Set Up

### 1. **Database Connection** (`lib/db.ts`)
- MongoDB connection with caching for Next.js
- Reusable connection instance across API routes
- Error handling and environment validation

### 2. **11 Mongoose Models** (`models/`)

| Model | Collection | Purpose |
|-------|-----------|---------|
| **Admin** | `admins` | System administrators for approvals & venue allocation |
| **Club** | `clubs` | Club entities with faculty coordination |
| **Student** | `students` | Student users with enrollment details |
| **Resource** | `resources` | Physical venues (Halls, Rooms, Labs) |
| **Event** | `events` | Events created by clubs, managed by admins |
| **EventClub** | `event_clubs` | Multi-club collaboration support |
| **EventRegistration** | `event_registrations` | Student registrations with waitlist |
| **Team** | `teams` | Team-based event participation |
| **TeamMember** | `team_members` | Individual team members |
| **EventSlot** | `event_slots` | Atomic capacity control (prevents race conditions) |
| **ActivityLog** | `activity_logs` | Audit trail for admin & club actions |

### 3. **Database Helpers** (`lib/db-helpers.ts`)
Pre-built utility functions for common operations:
- `logActivity()` - Audit logging
- `registerStudentForEvent()` - Smart registration with slot management
- `createEventWithSlots()` - Event creation with slot initialization
- `getEventWithDetails()` - Fetch event with all related data
- `createTeam()` - Create team-based event teams
- `addTeamMember()` - Add members to teams

## 🚀 Getting Started

### 1. **Configure Environment**
Copy `.env.example` to `.env.local` and add your MongoDB URI:

```bash
cp .env.example .env.local
```

Edit `.env.local`:
```
# For MongoDB Atlas (Cloud)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/event_management?retryWrites=true&w=majority

# For Local MongoDB
MONGODB_URI=mongodb://localhost:27017/event_management
```

### 2. **Verify Connection**
Create a test API route to verify the connection works:

```typescript
// app/api/test-connection/route.ts
import connectDB from '@/lib/db';
import { Admin } from '@/models';

export async function GET() {
  try {
    await connectDB();
    const adminCount = await Admin.countDocuments();
    return Response.json({ 
      status: 'connected', 
      adminCount 
    });
  } catch (error) {
    return Response.json({ 
      status: 'error', 
      error: (error as Error).message 
    }, { status: 500 });
  }
}
```

## 📝 Usage Examples

### Create a Club
```typescript
import connectDB from '@/lib/db';
import { Club } from '@/models';

export async function POST() {
  await connectDB();
  
  const club = await Club.create({
    club_name: 'Tech Club',
    email: 'tech@college.edu',
    password_hash: 'hashed_password',
    faculty_coordinator_name: 'Dr. Smith',
    description: 'Learn and build tech projects',
    is_active: true,
  });
  
  return Response.json(club);
}
```

### Register Student for Event
```typescript
import { registerStudentForEvent } from '@/lib/db-helpers';

const registration = await registerStudentForEvent(
  eventId,
  studentId
);
// Returns registration with CONFIRMED or WAITLISTED status
```

### Create Event with Slots
```typescript
import { createEventWithSlots } from '@/lib/db-helpers';

const event = await createEventWithSlots({
  primary_club_id: clubId,
  title: 'Hackathon 2025',
  description: 'Annual coding challenge',
  event_type: 'TEAM',
  requested_resource_type: 'HALL',
  date: new Date('2025-03-15'),
  start_time: '09:00',
  end_time: '17:00',
  min_participants: 2,
  max_participants: 100,
  registration_deadline: new Date('2025-03-10'),
});
// Automatically creates 100 event slots
```

### Log Activity
```typescript
import { logActivity } from '@/lib/db-helpers';

await logActivity(
  'ADMIN',
  adminId,
  'Approved event',
  eventId
);
```

## 🔑 Key Features

### Unique Constraints
- **Email fields**: Unique across Admin, Club, and Student collections
- **Event Registrations**: Prevents duplicate registrations
- **Teams**: Prevents duplicate team members
- **Event Clubs**: Ensures unique event-club combinations

### Indexing
- Composite indexes on foreign key relationships
- Performance indexes for common queries (activity logs)

### Relationships
All models support MongoDB references with `.populate()`:
```typescript
const event = await Event.findById(eventId)
  .populate('primary_club_id')
  .populate('allocated_resource_id');
```

## 🏗️ Architecture

**Connection Pattern**: Global connection caching for serverless edge execution
```
API Route → connectDB() → Cached connection → Mongoose operations
```

**Data Flow**:
1. Club creates event → Event stored with PENDING status
2. Admin allocates venue → allocated_resource_id updated
3. Admin approves → status changed to APPROVED
4. Students register → EventRegistration + EventSlot updated atomically
5. Activity logged → ActivityLog record created

## 📚 Additional Resources

- [Mongoose Documentation](https://mongoosejs.com/)
- [MongoDB Atlas Setup](https://www.mongodb.com/cloud/atlas)
- [Next.js Database Integration](https://nextjs.org/docs/app/building-your-application/data-fetching)

## ⚠️ Important Notes

1. **Never commit `.env.local`** - Add to `.gitignore` (should already be there)
2. **Password Hashing** - Use bcrypt for real implementations:
   ```bash
   npm install bcrypt
   npm install --save-dev @types/bcrypt
   ```
3. **Middleware** - Implement auth middleware for protected routes
4. **Validation** - Add Zod/Yup schemas matching your models
5. **Error Handling** - Add try-catch in all API routes

## ✨ Next Steps

1. Configure MongoDB URI in `.env.local`
2. Create API routes for CRUD operations
3. Implement authentication middleware
4. Add form validation using Zod
5. Deploy and test in production environment

---

**Status**: ✅ MongoDB integration complete and ready to use!
