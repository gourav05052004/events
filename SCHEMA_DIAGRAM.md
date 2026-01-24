# 📊 Database Schema Diagram

## Collections & Relationships

```
┌─────────────────────────────────────────────────────────────────┐
│                     EVENT MANAGEMENT SYSTEM                      │
└─────────────────────────────────────────────────────────────────┘

┌──────────────┐         ┌──────────────┐         ┌──────────────┐
│    ADMINS    │         │    CLUBS     │         │  STUDENTS    │
├──────────────┤         ├──────────────┤         ├──────────────┤
│ id (PK)      │         │ id (PK)      │         │ id (PK)      │
│ name         │         │ club_name    │         │ name         │
│ email ⚡     │         │ email ⚡     │         │ email ⚡     │
│ password_h   │         │ password_h   │         │ password_h   │
│ created_at   │         │ faculty_coor │         │ roll_number  │
└──────────────┘         │ description  │         │ department   │
       │                 │ is_active    │         │ batch        │
       │                 │ created_at   │         │ created_at   │
       │                 └──────────────┘         └──────────────┘
       │                       │                         │
       │                       │                         │
       │        ┌──────────────┴─────────┐               │
       │        │                        │               │
       │        ▼                        ▼               │
       │   ┌──────────────────────────────────┐          │
       │   │           EVENTS                 │          │
       │   ├──────────────────────────────────┤          │
       │   │ id (PK)                          │          │
       │   │ primary_club_id (FK) ──┐         │          │
       │   │ title                   │         │          │
       │   │ description            │         │          │
       │   │ event_type             │         │          │
       │   │ status                 │         │          │
       │   │ requested_resource_type│         │          │
       │   │ allocated_resource_id ──┐        │          │
       │   │ date, start_time       │ │       │          │
       │   │ min/max_participants   │ │       │          │
       │   │ registration_deadline  │ │       │          │
       │   │ created_at             │ │       │          │
       │   └──────────────────────────────────┘          │
       │                      │    │                     │
       │                      │    │                     │
       │                      │    └──► ┌─────────────┐  │
       │                      │         │  RESOURCES  │  │
       │                      │         ├─────────────┤  │
       │                      │         │ id (PK)     │  │
       │                      │         │ name        │  │
       │                      │         │ type (enum) │  │
       │                      │         │ capacity    │  │
       │                      │         │ created_at  │  │
       │                      │         └─────────────┘  │
       │                      │                          │
       │                      ▼                          │
       │        ┌──────────────────────────┐             │
       │        │   EVENT_REGISTRATIONS    │             │
       │        ├──────────────────────────┤             │
       │        │ id (PK)                  │             │
       │        │ event_id (FK) ◄──────────┼─────────────┘
       │        │ student_id (FK) ◄────────┼─────────────┐
       │        │ status (enum)            │             │
       │        │ registered_at            │             │
       │        └──────────────────────────┘             │
       │                                                  │
       │        ┌──────────────────────────┐             │
       │        │    EVENT_CLUBS           │             │
       │        ├──────────────────────────┤             │
       │        │ id (PK)                  │             │
       │        │ event_id (FK) ◄──────────┼─────────────┼──┐
       │        │ club_id (FK) ◄───────────┼──────────────┐ │
       │        │ role (enum)              │              │ │
       │        └──────────────────────────┘              │ │
       │                                                  │ │
       │        ┌──────────────────────────┐              │ │
       │        │    EVENT_SLOTS           │              │ │
       │        ├──────────────────────────┤              │ │
       │        │ id (PK)                  │              │ │
       │        │ event_id (FK) ◄──────────┼──────────────┼─┼─┐
       │        │ slot_number              │              │ │ │
       │        │ allocated (boolean)      │              │ │ │
       │        └──────────────────────────┘              │ │ │
       │                                                  │ │ │
       │        ┌──────────────────────────┐              │ │ │
       │        │   TEAMS                  │              │ │ │
       │        ├──────────────────────────┤              │ │ │
       │        │ id (PK)                  │              │ │ │
       │        │ event_id (FK) ◄──────────┼──────────────┘ │ │
       │        │ team_name                │                │ │
       │        │ team_leader_id (FK) ─────┼────────────────┼─┘
       │        │ created_at               │                │
       │        └──────────────────────────┘                │
       │                      │                            │
       │                      ▼                            │
       │        ┌──────────────────────────┐               │
       │        │   TEAM_MEMBERS           │               │
       │        ├──────────────────────────┤               │
       │        │ id (PK)                  │               │
       │        │ team_id (FK) ◄──────────┬┤               │
       │        │ student_id (FK) ◄───────┼┼───────────────┘
       │        └──────────────────────────┘│
       │                                     │
       │        ┌──────────────────────────┐│
       │        │   ACTIVITY_LOGS          ││
       │        ├──────────────────────────┤│
       │        │ id (PK)                  ││
       │        │ actor_type (enum)        ││
       │        │ actor_id (FK) ◄──────────┘
       │        │ action                   │
       │        │ target_event_id (FK)     │
       │        │ created_at               │
       │        └──────────────────────────┘
       │
       └──────────────────────────────────────►
              (Admin performs all operations)
```

## Key Relationships

### Many-to-Many Relationships
- **Events ↔ Clubs** (via `event_clubs`)
  - One event can have multiple clubs (ORGANIZER + CO_ORGANIZERS)
  - One club can organize multiple events

- **Events ↔ Students** (via `event_registrations`)
  - One event can have many student registrations
  - One student can register for many events

- **Teams ↔ Students** (via `team_members`)
  - One team has many members
  - One student can be in multiple teams (across different events)

### One-to-Many Relationships
- **Events → Event Slots** (Atomic capacity control)
- **Events → Teams** (For team-based events)
- **Teams → Team Members**

## Unique Constraints ⚡

| Field | Collection | Purpose |
|-------|-----------|---------|
| `email` | admins | Admin authentication |
| `email` | clubs | Club authentication |
| `email` | students | Student authentication |
| `email + password` | Implied | Login validation |
| `event_id + student_id` | event_registrations | Prevent duplicate registrations |
| `event_id + club_id` | event_clubs | One role per event-club pair |
| `team_id + student_id` | team_members | Prevent duplicate team members |
| `event_id + slot_number` | event_slots | Unique slots per event |

## Indexes for Performance 🚀

```javascript
// Primary Lookups
- admins: { email: 1 }
- clubs: { email: 1 }
- students: { email: 1, roll_number: 1 }
- events: { primary_club_id: 1, status: 1, date: 1 }
- resources: { type: 1 }

// Relationship Queries
- event_clubs: { event_id: 1, club_id: 1 }
- event_registrations: { event_id: 1, student_id: 1 }
- event_slots: { event_id: 1, allocated: 1 }
- team_members: { team_id: 1, student_id: 1 }
- teams: { event_id: 1, team_leader_id: 1 }

// Audit & Analytics
- activity_logs: { created_at: -1, actor_type: 1, actor_id: 1 }
```

## Data Flow Examples

### Scenario 1: Student Registers for Individual Event
```
1. Student submits registration
   ├─► Check event_registrations (prevent duplicate)
   ├─► Check event_slots (find available slot)
   ├─► Create event_registration
   ├─► Update event_slot (allocated = true)
   └─► Log activity
```

### Scenario 2: Admin Approves Event & Allocates Venue
```
1. Admin reviews pending event
   ├─► Read event (status = PENDING)
   ├─► Check available resources
   ├─► Allocate resource
   ├─► Update event (status = APPROVED, allocated_resource_id)
   └─► Log activity
```

### Scenario 3: Club Creates Team Event
```
1. Club creates event with event_type = TEAM
   ├─► Create event document
   ├─► Create event_clubs (ORGANIZER)
   ├─► Initialize event_slots (for team capacity)
   └─► Log activity

2. Student creates team
   ├─► Create team (team_leader_id)
   ├─► Add team_leader as team_member
   └─► Log activity

3. Student adds team members
   ├─► Create team_member records
   └─► Log activity
```

## State Transitions

### Event Status Flow
```
PENDING (Created by club)
   │
   ▼
APPROVED (Allocated by admin) OR CANCELLED
   │
   ▼
RESCHEDULED (Admin changes date/time)
   │
   ▼
CANCELLED (Any state)
```

### Registration Status Flow
```
CONFIRMED (When slots available)
   │
   └──► WAITLISTED (When no slots available)
```

## Scale Estimates

With proper indexing, this schema supports:
- **Admins**: 10-100 (small team)
- **Clubs**: 100-1000 (per institution)
- **Students**: 10,000-100,000 (per institution)
- **Resources**: 100-1000 (venues)
- **Events**: 1,000-10,000 (per year)
- **Registrations**: 100,000-1,000,000 (per year)
- **Activity Logs**: 1,000,000+ (audit trail)

---

**Last Updated**: January 24, 2026
**Schema Version**: 1.0
