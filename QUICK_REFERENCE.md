# 📋 MongoDB Integration - Quick Reference Card

## Installation Status ✅

```
✅ mongoose@^8.21.1 installed
✅ mongodb@^6.21.0 installed
✅ All 11 models created
✅ Database connection setup
✅ Helper utilities ready
✅ Full TypeScript support
✅ Complete documentation
```

## 📊 11 Collections at a Glance

```
ADMINS (5 fields)
├─ id, email, password_hash, name, created_at

CLUBS (7 fields)
├─ id, email, password_hash, club_name, description
├─ faculty_coordinator_name, is_active, created_at

STUDENTS (7 fields)
├─ id, email, password_hash, name, roll_number
├─ department, batch, created_at

RESOURCES (4 fields)
├─ id, name, type (HALL|ROOM|LAB), capacity, created_at

EVENTS (13 fields)
├─ id, primary_club_id (FK), title, description
├─ event_type (INDIVIDUAL|TEAM), status (PENDING|APPROVED|CANCELLED|RESCHEDULED)
├─ allocated_resource_id (FK), requested_resource_type
├─ date, start_time, end_time, min/max_participants
├─ registration_deadline, poster_url, created_at

EVENT_CLUBS (3 fields)
├─ id, event_id (FK), club_id (FK), role (ORGANIZER|CO_ORGANIZER)

EVENT_REGISTRATIONS (4 fields)
├─ id, event_id (FK), student_id (FK)
├─ status (CONFIRMED|WAITLISTED), registered_at

TEAMS (4 fields)
├─ id, event_id (FK), team_name, team_leader_id (FK), created_at

TEAM_MEMBERS (2 fields)
├─ id, team_id (FK), student_id (FK)

EVENT_SLOTS (3 fields)
├─ id, event_id (FK), slot_number, allocated (boolean)

ACTIVITY_LOGS (5 fields)
├─ id, actor_type (ADMIN|CLUB), actor_id
├─ action, target_event_id (FK), created_at
```

## 🔗 Relationships Map

```
ADMINS
  ├─ Approves → EVENTS
  └─ Allocates → RESOURCES → EVENTS

CLUBS
  ├─ Creates → EVENTS (primary_club_id)
  └─ Collaborates → EVENT_CLUBS ← EVENTS

STUDENTS
  ├─ Register → EVENT_REGISTRATIONS ← EVENTS
  ├─ Create → TEAMS (team_leader_id)
  └─ Join → TEAM_MEMBERS ← TEAMS

EVENTS
  ├─ Has many → EVENT_REGISTRATIONS
  ├─ Has many → TEAMS
  ├─ Has many → EVENT_SLOTS
  ├─ Links to → EVENT_CLUBS
  ├─ Allocated to → RESOURCES
  └─ Logged → ACTIVITY_LOGS
```

## 💾 File Structure

```
lib/
├── db.ts                 (Connection - 45 lines)
├── db-helpers.ts        (6 utility functions - 200+ lines)
└── utils.ts             (existing)

models/
├── Admin.ts             (Admin schema)
├── Club.ts              (Club schema)
├── Student.ts           (Student schema)
├── Resource.ts          (Resource schema)
├── Event.ts             (Event schema)
├── EventClub.ts         (EventClub schema)
├── EventRegistration.ts (EventRegistration schema)
├── Team.ts              (Team schema)
├── TeamMember.ts        (TeamMember schema)
├── EventSlot.ts         (EventSlot schema)
├── ActivityLog.ts       (ActivityLog schema)
└── index.ts             (Centralized exports)

Documentation/
├── README_MONGODB.md         (Start here)
├── SETUP_INSTRUCTIONS.md     (10-step setup)
├── MONGODB_SETUP.md          (Detailed guide)
├── INTEGRATION_SUMMARY.md    (Quick reference)
├── SCHEMA_DIAGRAM.md         (Visual relationships)
├── API_PATTERNS.md           (Common patterns)
├── API_EXAMPLES.md           (10 implementations)
├── COMPLETION_CHECKLIST.md   (Progress tracker)
└── This file                 (Quick card)
```

## 🚀 Quick Start Commands

```bash
# 1. Create environment file
cp .env.example .env.local

# 2. Edit with your MongoDB URI
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/db

# 3. Start development server
npm run dev

# 4. Test connection
curl http://localhost:3000/api/test
```

## 📝 Import Models

```typescript
// Single imports
import { Event } from '@/models';
import { Club, type IClub } from '@/models';

// Multiple imports
import {
  Event,
  Student,
  EventRegistration,
  type IEvent,
  type IStudent,
} from '@/models';

// Helpers
import {
  registerStudentForEvent,
  createEventWithSlots,
  logActivity,
} from '@/lib/db-helpers';

// Connection
import connectDB from '@/lib/db';
```

## 🔧 Common Operations

```typescript
// Connect
await connectDB();

// Find
const event = await Event.findById(id);
const events = await Event.find({ status: 'APPROVED' });

// Populate relationships
const event = await Event.findById(id)
  .populate('primary_club_id')
  .populate('allocated_resource_id');

// Create
const event = await Event.create(data);

// Update
await Event.findByIdAndUpdate(id, updates, { new: true });

// Delete
await Event.findByIdAndDelete(id);

// Count
const count = await Event.countDocuments({ status: 'PENDING' });

// Log activity
await logActivity('ADMIN', adminId, 'Approved event', eventId);

// Register student
const reg = await registerStudentForEvent(eventId, studentId);
```

## 🔑 Unique Constraints

```
admins.email         → UNIQUE
clubs.email          → UNIQUE
students.email       → UNIQUE
students.roll_number → UNIQUE
event_registrations  → UNIQUE (event_id, student_id)
event_clubs          → UNIQUE (event_id, club_id)
team_members         → UNIQUE (team_id, student_id)
event_slots          → UNIQUE (event_id, slot_number)
```

## 📈 Performance Indexes

```
admins               → email (unique)
clubs                → email (unique)
students             → email (unique), roll_number (unique)
events               → primary_club_id, status, date
resources            → type
event_clubs          → event_id, club_id
event_registrations  → event_id, student_id
event_slots          → event_id, allocated
teams                → event_id, team_leader_id
team_members         → team_id, student_id
activity_logs        → created_at DESC, actor_type, actor_id
```

## 🛠️ Helper Functions Reference

| Function | Parameters | Returns | Use Case |
|----------|-----------|---------|----------|
| `logActivity()` | type, id, action, eventId | void | Audit logging |
| `registerStudentForEvent()` | eventId, studentId | Registration | Smart signup |
| `createEventWithSlots()` | eventData | Event | Event creation |
| `getEventWithDetails()` | eventId | Details | Full event info |
| `createTeam()` | eventId, name, leaderId | Team | Team events |
| `addTeamMember()` | teamId, studentId | Member | Add to team |

## 📚 Documentation Quick Links

| Need | Document |
|------|----------|
| Step-by-step setup | SETUP_INSTRUCTIONS.md |
| Build first API | API_EXAMPLES.md |
| Understand schema | SCHEMA_DIAGRAM.md |
| See patterns | API_PATTERNS.md |
| Overall summary | INTEGRATION_SUMMARY.md |
| Full setup guide | MONGODB_SETUP.md |
| Track progress | COMPLETION_CHECKLIST.md |
| Start here | README_MONGODB.md |

## ✨ Features Summary

```
✅ Full TypeScript support
✅ 11 collections with relationships
✅ Race-condition free booking (slots)
✅ Automatic connection caching
✅ 6 pre-built helper functions
✅ Complete activity logging
✅ Waitlist support
✅ Multi-club events
✅ Team management
✅ Unique constraints
✅ Performance indexes
✅ Comprehensive documentation
✅ 10 API examples
```

## 🎯 Development Workflow

```
1. Review SETUP_INSTRUCTIONS.md
        ↓
2. Configure .env.local
        ↓
3. Test connection (api/test)
        ↓
4. Pick API from API_EXAMPLES.md
        ↓
5. Build in app/api/
        ↓
6. Add Zod validation
        ↓
7. Add auth middleware
        ↓
8. Test with curl/Postman
        ↓
9. Deploy
```

## 🔐 Security Checklist

```
□ Copy .env.example to .env.local
□ Add MongoDB URI
□ Install bcrypt (npm install bcrypt)
□ Hash passwords before storing
□ Implement JWT auth
□ Add auth middleware
□ Validate inputs with Zod
□ Never expose secrets in client
□ Use HTTPS in production
□ Add rate limiting
□ Monitor activity logs
```

## 📊 Scale Estimates

```
Admins:         10-100
Clubs:          100-1,000
Students:       10,000-100,000
Resources:      100-1,000
Events:         1,000-10,000/year
Registrations:  100,000-1,000,000/year
Team Events:    10%-30% of events
Activity Logs:  1,000,000+
```

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| Cannot find mongoose | `npm install mongoose` |
| MONGODB_URI not found | Copy .env.example → .env.local + add URI |
| Connection timeout | Check URI + network connectivity |
| Model already compiled | Normal in dev, models are cached |
| Duplicate key error | Check unique constraints + existing data |

## 🎓 Key Concepts

**Connection Caching**: Global cached connection for serverless
**Populate**: MongoDB references for joining data
**Atomic Operations**: EventSlots prevent overbooking
**Unique Constraints**: Prevent invalid data (duplicate registrations)
**Indexes**: Performance optimization on common queries
**Activity Logs**: Complete audit trail of all actions

## 📞 Support Resources

- Mongoose: https://mongoosejs.com
- MongoDB: https://docs.mongodb.com
- Next.js Data: https://nextjs.org/docs/app/building-your-application/data-fetching
- API Examples: See API_EXAMPLES.md in project

---

**Status**: ✅ Complete & Ready to Use
**Date**: January 24, 2026
**Version**: 1.0

**Start building with SETUP_INSTRUCTIONS.md →**
