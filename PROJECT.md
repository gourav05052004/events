# Project Overview: Event Management Platform

## Introduction
This project is a full-stack event management platform designed for universities or organizations to manage events, clubs, venues, and registrations. It features separate dashboards for admins, clubs, and students, with robust authentication and role-based access control.

---

## Features
- **Admin Panel**: Manage clubs, venues, events, and settings. View dashboards and logs.
- **Club Panel**: Create/manage events, view team, update club settings, and see event registrations.
- **Student Panel**: Register for events, view personal dashboard, and manage profile.
- **Authentication**: JWT-based login for admins, clubs, and students.
- **Event Management**: CRUD operations for events, slots, and registrations.
- **Venue Management**: Add/edit venues, assign to events.
- **Activity Logs**: Track actions for auditing.
- **Responsive UI**: Built with Next.js and React, styled for modern usability.

---

## Tech Stack
- **Frontend**: Next.js (App Router), React, TypeScript, Tailwind CSS
- **Backend**: Next.js API routes
- **Database**: MongoDB Atlas (Mongoose ODM)
- **Authentication**: JWT
- **Cloudinary**: For image uploads
- **Other**: ESLint, PostCSS, Hot Toast for notifications

---

## Project Structure
- `/app` — Main Next.js app directory, with subfolders for each user role and feature
- `/components` — Reusable React components (modals, navbars, cards, etc.)
- `/lib` — Utility libraries (DB connection, auth, Cloudinary, helpers)
- `/models` — Mongoose models for all entities (Admin, Club, Event, Student, etc.)
- `/public` — Static assets
- `/scripts` — Seed and utility scripts

---

## Key Files
- `app/api/` — All API endpoints (RESTful, organized by role and feature)
- `lib/db.ts` — MongoDB connection logic
- `models/` — Mongoose schemas for all collections
- `.env.local` — Environment variables (MongoDB URI, secrets)
- `README_MONGODB.md`, `MONGODB_SETUP.md` — MongoDB setup guides
- `JWT_AUTH_GUIDE.md` — JWT authentication details
- `SCHEMA_DIAGRAM.md` — Database schema diagram

---

## Setup Instructions
1. Clone the repository.
2. Install dependencies: `npm install`
3. Set up your `.env.local` with MongoDB URI and secrets.
4. Seed the database using scripts in `/scripts` if needed.
5. Run the development server: `npm run dev`
6. Access the app at `http://localhost:3000`

---

## Authentication & Roles
- **Admin**: Full access to all resources and settings.
- **Club**: Manage own events, team, and settings.
- **Student**: Register for events, manage profile.
- JWT tokens are used for secure authentication and API access.

---

## Database Models
- **Admin**: Admin users
- **Club**: Clubs and their details
- **Event**: Events and their metadata
- **EventRegistration**: Student registrations for events
- **Venue**: Event venues
- **Student**: Student users
- **Team/TeamMember**: Club teams
- **ActivityLog**: Audit logs

---

## API Endpoints
- `/api/admin/*` — Admin operations
- `/api/club/*` — Club operations
- `/api/student/*` — Student operations
- `/api/events/*` — Public event endpoints
- `/api/auth/*` — Authentication endpoints

---

## Guides & References
- **Admin Login**: See `ADMIN_LOGIN_GUIDE.md`
- **JWT Auth**: See `JWT_AUTH_GUIDE.md`
- **MongoDB Setup**: See `MONGODB_SETUP.md`, `README_MONGODB.md`
- **React Hot Toast**: See `REACT_HOT_TOAST_GUIDE.md`
- **Quick Reference**: See `QUICK_REFERENCE.md`

---

## Scripts
- `scripts/seed-admin.js` — Seed admin user
- `scripts/seed-club.js` — Seed club users
- `scripts/seed-venues.js` — Seed venues
- `scripts/check-registrations.js` — Utility for registrations

---

## Contribution
- Follow the code style in `eslint.config.mjs`.
- Use TypeScript for all new code.
- Document new features and update this file as needed.

---

## License
Specify your license here.

---

## Contact
For questions or support, contact the project maintainer or check the guides in the repository.

---

# College Event Management System: Project Review & Completion Roadmap

## 1. Feature Implementation Status

### Core Dashboards
- **Admin Dashboard**
  - ✅ Exists: [app/admin/dashboard/page.tsx](app/admin/dashboard/page.tsx)
  - ✅ Event approval logic present ([app/api/admin/events/route.ts](app/api/admin/events/route.ts), [models/Event.ts](models/Event.ts))
  - ⚠️ Needs thorough review for edge cases (e.g., bulk approval, rejection reasons, audit logging)
- **Club Dashboard**
  - ✅ Exists: [app/club/dashboard/page.tsx](app/club/dashboard/page.tsx)
  - ✅ Event creation ([app/club/create-event/page.tsx](app/club/create-event/page.tsx), [app/api/admin/events/route.ts](app/api/admin/events/route.ts))
  - ⚠️ Event editing/deletion: Implementation unclear or partial
- **Student Dashboard**
  - ✅ Exists: [app/student/dashboard/page.tsx](app/student/dashboard/page.tsx)
  - ✅ Event registration ([app/api/student/registrations/](app/api/student/registrations/))
  - ⚠️ Registration status tracking, event reminders, and cancellation: Partial or missing

### Authentication & Authorization
- ✅ JWT-based auth ([lib/jwt-utils.ts](lib/jwt-utils.ts), [middleware.ts](middleware.ts))
- ✅ Separate login/register for admin, club, student ([app/api/auth/](app/api/auth/))
- ⚠️ Role-based route protection: Present but needs more granular checks

### Event Lifecycle
- ✅ Clubs can create events ([app/club/create-event/page.tsx](app/club/create-event/page.tsx))
- ✅ Admins can approve events ([app/api/admin/events/route.ts](app/api/admin/events/route.ts))
- ✅ Students can register for approved events ([app/api/student/registrations/route.ts](app/api/student/registrations/route.ts))
- ⚠️ Event editing, cancellation, and notification flows: Partial or missing

### Venue & Club Management
- ✅ Venue CRUD ([app/api/admin/venues/](app/api/admin/venues/), [components/add-venue-modal.tsx](components/add-venue-modal.tsx))
- ✅ Club CRUD ([app/api/admin/clubs/](app/api/admin/clubs/), [components/add-club-modal.tsx](components/add-club-modal.tsx))
- ⚠️ Club membership/team management: Partial ([app/club/team/page.tsx](app/club/team/page.tsx)), needs more features (invites, roles)

### Miscellaneous
- ✅ Toast notifications ([components/toaster-provider.tsx](components/toaster-provider.tsx))
- ✅ Stats cards, event cards, modals, sidebar ([components/](components/))
- ⚠️ Activity logging: Present ([models/ActivityLog.ts](models/ActivityLog.ts)), but coverage unclear
- ⚠️ Settings/profile management: Present, but needs more depth (password reset, email change, etc.)

---

## 2. Missing or Incomplete Features
- ❌ Email notifications (event approval, registration confirmation, reminders)
- ❌ Password reset/forgot password flows
- ❌ Admin/club analytics (event stats, registration trends)
- ❌ Bulk actions (approve/reject multiple events, manage multiple users)
- ❌ Audit logs for critical actions (event approval, user management)
- ❌ Comprehensive error handling and user feedback
- ❌ Accessibility and responsive design checks
- ❌ Rate limiting, brute-force protection on auth endpoints
- ❌ End-to-end and integration tests

---

## 3. Bugs, Weak Implementations, Risks
- 🐞 Inconsistent error handling in API routes (e.g., missing try/catch, unclear error messages)
- 🐞 Some API endpoints lack authentication/authorization checks (risk of privilege escalation)
- 🐞 No input validation/sanitization in several routes (risk: injection, bad data)
- 🐞 Club and event deletion may not cascade properly (orphaned records)
- 🐞 No pagination or filtering on event/club lists (scalability risk)
- 🐞 Hardcoded strings and magic numbers in components
- 🐞 No environment variable checks for critical configs (e.g., JWT secret, DB URI)
- 🐞 Potential race conditions in registration logic (overbooking events)
- 🐞 No file upload validation for event images (risk: malicious uploads)

---

## 4. Code Quality, Architecture, Scalability Suggestions
- Refactor API route logic into service/controller layers for testability and reuse
- Centralize error handling and response formatting
- Use Zod or Joi for input validation on all API endpoints
- Implement pagination, filtering, and sorting for all list endpoints
- Move magic strings/numbers to constants or config files
- Add logging (e.g., Winston, Pino) for production diagnostics
- Use environment variable validation (e.g., with dotenv-safe)
- Add rate limiting middleware (e.g., express-rate-limit or similar for Next.js)
- Write integration and E2E tests (e.g., Jest, Playwright)
- Modularize components and hooks for reusability
- Document API endpoints (Swagger/OpenAPI or similar)
- Ensure all user-facing components are accessible (a11y) and responsive

---

## 5. Step-by-Step Roadmap (Priority Order)

### 1. Security & Data Integrity
- Add comprehensive input validation to all API endpoints
- Enforce authentication and role-based authorization everywhere
- Implement rate limiting and brute-force protection
- Add environment variable validation

### 2. Core Feature Completion
- Finish event editing, deletion, and cancellation flows
- Complete club/team management (invites, roles, removals)
- Implement registration status tracking and cancellation for students
- Add email notification system (approval, registration, reminders)
- Implement password reset/forgot password flows

### 3. Usability & Scalability
- Add pagination, filtering, and sorting to all list endpoints
- Refactor API logic into service/controller layers
- Centralize error handling and response formatting
- Add bulk actions for admins (event/user management)
- Implement audit logging for critical actions

### 4. Quality & Testing
- Write integration and E2E tests for all major flows
- Add logging for diagnostics and monitoring
- Ensure all components are accessible and responsive

### 5. Analytics & Enhancements
- Build admin/club analytics dashboards
- Add event registration trends and stats
- Implement advanced search for events/clubs

### 6. Documentation & Handoff
- Document all API endpoints and data models
- Write setup, deployment, and troubleshooting guides
- Clean up codebase, remove dead code, and finalize README/PROJECT.md

---

This roadmap and review should guide the next developer or LLM to efficiently complete and harden the project for production use.
