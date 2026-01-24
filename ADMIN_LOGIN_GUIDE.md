# 🔐 Admin Login System - Setup Guide

## Overview

A complete admin authentication system with:
- ✅ Admin registration API
- ✅ Admin login API
- ✅ Password hashing with bcryptjs
- ✅ MongoDB storage
- ✅ Admin seeding script

## Files Created

### Authentication Utilities
- **lib/auth-utils.ts** - Password hashing and verification functions

### API Routes
- **app/api/auth/admin-register/route.ts** - Register new admin
- **app/api/auth/admin-login/route.ts** - Login admin

### Seeding Script
- **scripts/seed-admin.js** - Create initial admin account

## Setup Instructions

### Step 1: Install Dependencies

```bash
npm install bcryptjs
```

### Step 2: Create Initial Admin Account

Run the seeding script:

```bash
npm run seed
```

**Output:**
```
✅ Admin created successfully!

📋 Admin Credentials:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   Email:    admin@college.edu
   Password: Admin@123456
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## Usage

### Login Admin

**Endpoint:** `POST /api/auth/admin-login`

**Request:**
```json
{
  "email": "admin@college.edu",
  "password": "Admin@123456"
}
```

**Success Response (200):**
```json
{
  "message": "Login successful",
  "admin": {
    "id": "507f1f77bcf86cd799439011",
    "name": "Administrator",
    "email": "admin@college.edu",
    "created_at": "2026-01-24T10:30:00.000Z"
  }
}
```

**Error Response (401):**
```json
{
  "error": "Invalid email or password"
}
```

### Register New Admin

**Endpoint:** `POST /api/auth/admin-register`

**Request:**
```json
{
  "name": "Senior Admin",
  "email": "senior@college.edu",
  "password": "SecurePassword123"
}
```

**Success Response (201):**
```json
{
  "message": "Admin registered successfully",
  "admin": {
    "id": "507f1f77bcf86cd799439012",
    "name": "Senior Admin",
    "email": "senior@college.edu"
  }
}
```

## Testing with cURL

### Test Login

```bash
curl -X POST http://localhost:3000/api/auth/admin-login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@college.edu",
    "password": "Admin@123456"
  }'
```

### Test Registration

```bash
curl -X POST http://localhost:3000/api/auth/admin-register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "New Admin",
    "email": "newadmin@college.edu",
    "password": "NewPassword123"
  }'
```

### Test with Postman

1. **Create new request**
2. **Method:** POST
3. **URL:** `http://localhost:3000/api/auth/admin-login`
4. **Body (JSON):**
   ```json
   {
     "email": "admin@college.edu",
     "password": "Admin@123456"
   }
   ```
5. **Send**

## Security Best Practices

### ✅ Implemented
- Password hashing with bcryptjs (10 salt rounds)
- Email validation
- Password length validation (minimum 6 characters)
- Case-insensitive email storage
- Unique email constraint

### 🔒 Recommended Additional Features

1. **JWT Tokens**
   ```typescript
   // Generate JWT on login
   const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET);
   ```

2. **Protected Routes**
   ```typescript
   // Verify JWT before allowing admin operations
   const user = verifyToken(request.headers.get('Authorization'));
   ```

3. **Rate Limiting**
   ```typescript
   // Prevent brute force attacks
   // Use libraries like express-rate-limit
   ```

4. **Password Reset**
   ```typescript
   // Email verification for password reset
   ```

5. **Session Management**
   ```typescript
   // Logout endpoint to invalidate tokens
   ```

## Database Schema

### Admins Collection
```javascript
{
  _id: ObjectId,
  name: String,              // Admin name
  email: String,             // Unique email
  password_hash: String,     // Bcrypt hashed password
  created_at: Date           // Creation timestamp
}
```

**Indexes:**
- `email` - Unique index for fast lookups

## Error Handling

| Error | Status | Message |
|-------|--------|---------|
| Missing fields | 400 | "Email, password, and name are required" |
| Short password | 400 | "Password must be at least 6 characters" |
| Duplicate email | 409 | "Email already registered" |
| Invalid credentials | 401 | "Invalid email or password" |
| DB error | 500 | Error message |

## Troubleshooting

### Admin not created?
- Check `.env.local` has valid `MONGODB_URI`
- Ensure MongoDB is accessible
- Run `npm run seed` again

### Login returns 401?
- Verify credentials match exactly
- Email is case-insensitive but must match
- Password is case-sensitive

### "Email already registered"?
- Admin already exists
- Use different email or delete the existing one
- Edit `/scripts/seed-admin.js` to create with different email

## Next Steps

1. ✅ Run `npm run seed` to create initial admin
2. ✅ Test login with provided credentials
3. ✅ Create authentication middleware for protected routes
4. ✅ Add JWT token generation
5. ✅ Implement logout and password reset

## Example: Protected Admin Route

```typescript
// app/api/admin/dashboard/route.ts
import connectDB from '@/lib/db';
import { Admin } from '@/models';

export async function GET(request: Request) {
  try {
    // In production, verify JWT token here
    const adminId = request.headers.get('X-Admin-ID');
    
    if (!adminId) {
      return Response.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();
    const admin = await Admin.findById(adminId);
    
    if (!admin) {
      return Response.json(
        { error: 'Admin not found' },
        { status: 404 }
      );
    }

    return Response.json({
      message: 'Welcome to admin dashboard',
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

## Files Summary

| File | Purpose | Status |
|------|---------|--------|
| lib/auth-utils.ts | Hash & verify passwords | ✅ Created |
| app/api/auth/admin-register/route.ts | Register new admin | ✅ Created |
| app/api/auth/admin-login/route.ts | Login admin | ✅ Created |
| scripts/seed-admin.js | Create initial admin | ✅ Created |
| package.json | Added seed script | ✅ Updated |

---

**Status**: ✅ Complete & Ready to Use

**Run**: `npm run seed` to create the initial admin account!
