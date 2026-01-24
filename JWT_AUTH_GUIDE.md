# 🔐 JWT Authentication Guide

## Overview

JWT (JSON Web Tokens) have been integrated into your authentication system for stateless, secure token-based authentication.

## What's New

### ✅ New Files Created

1. **lib/jwt-utils.ts** - JWT utility functions
   - `generateToken()` - Create JWT tokens
   - `verifyToken()` - Verify and decode tokens
   - `decodeToken()` - Decode without verification
   - `extractTokenFromHeader()` - Extract token from Authorization header
   - `isTokenExpired()` - Check token expiration
   - `refreshToken()` - Create new token from existing one

2. **lib/middleware.ts** - Authentication middleware
   - `verifyRequestToken()` - Verify token from request
   - `requireAuth()` - Enforce authentication on routes
   - `getAuthHeader()` - Get authorization header

3. **app/api/auth/verify-token/route.ts** - Token verification endpoint
   - POST and GET support
   - Returns token validity and payload

4. **app/api/auth/logout/route.ts** - Logout endpoint
   - Instructs client to discard token
   - Clears site data headers

5. **app/api/admin/dashboard/route.ts** - Protected route example
   - Demonstrates protected endpoint usage
   - Returns admin statistics

### ✅ Updated Files

1. **app/api/auth/admin-login/route.ts** - Now returns JWT token
2. **.env.local** - Added JWT_SECRET and JWT_EXPIRY
3. **.env.example** - Added JWT configuration template
4. **package.json** - Added jsonwebtoken dependency

## Configuration

### Environment Variables

```env
# JWT Secret Key (CHANGE IN PRODUCTION!)
JWT_SECRET=your-secret-key-here-change-in-production

# Token Expiration Time (default: 7 days)
JWT_EXPIRY=7d
```

**⚠️ IMPORTANT:** Set a strong, unique `JWT_SECRET` in production:

```bash
# Generate a secure random secret on Linux/Mac:
openssl rand -base64 32

# Or use any random string generator
```

## API Endpoints

### 1. Login (Get Token)

```http
POST /api/auth/admin-login
Content-Type: application/json

{
  "email": "admin@college.edu",
  "password": "Admin@123456"
}
```

**Response (200):**
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "admin": {
    "id": "507f1f77bcf86cd799439011",
    "name": "Administrator",
    "email": "admin@college.edu",
    "created_at": "2026-01-24T10:30:00.000Z"
  }
}
```

### 2. Verify Token

```http
POST /api/auth/verify-token
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response (200):**
```json
{
  "valid": true,
  "payload": {
    "adminId": "507f1f77bcf86cd799439011",
    "email": "admin@college.edu",
    "name": "Administrator"
  }
}
```

**Response (401):**
```json
{
  "error": "Invalid or expired token"
}
```

### 3. Protected Route (Dashboard)

```http
GET /api/admin/dashboard
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response (200):**
```json
{
  "message": "Admin dashboard data",
  "admin": {
    "id": "507f1f77bcf86cd799439011",
    "email": "admin@college.edu",
    "name": "Administrator"
  },
  "statistics": {
    "totalEvents": 15,
    "totalRegistrations": 250,
    "eventsByStatus": [
      { "_id": "approved", "count": 10 },
      { "_id": "pending", "count": 3 },
      { "_id": "rejected", "count": 2 }
    ]
  },
  "timestamp": "2026-01-24T12:00:00.000Z"
}
```

### 4. Logout

```http
POST /api/auth/logout
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response (200):**
```json
{
  "message": "Logout successful",
  "instruction": "Please clear your token from storage and redirect to login"
}
```

## Using JWT in Frontend

### Example: Login and Store Token

```javascript
// Login
const response = await fetch('http://localhost:3000/api/auth/admin-login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'admin@college.edu',
    password: 'Admin@123456'
  })
});

const data = await response.json();

// Store token
localStorage.setItem('authToken', data.token);
```

### Example: Use Token in Protected Requests

```javascript
// Fetch dashboard data
const token = localStorage.getItem('authToken');
const response = await fetch('http://localhost:3000/api/admin/dashboard', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

const dashboard = await response.json();
```

### Example: Verify Token

```javascript
const token = localStorage.getItem('authToken');
const response = await fetch('http://localhost:3000/api/auth/verify-token', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

if (response.ok) {
  console.log('Token is valid');
} else {
  console.log('Token expired or invalid - redirect to login');
}
```

### Example: Logout

```javascript
const token = localStorage.getItem('authToken');
await fetch('http://localhost:3000/api/auth/logout', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

// Clear local storage
localStorage.removeItem('authToken');

// Redirect to login
window.location.href = '/login';
```

## Using JWT in Protected Routes

### Create Protected Route

```typescript
// app/api/protected-resource/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { verifyRequestToken } from '@/lib/middleware';

export async function GET(request: NextRequest) {
  // Verify token
  const payload = verifyRequestToken(request);
  if (!payload) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  // Token is valid, use payload
  return NextResponse.json({
    message: 'Access granted',
    admin: payload
  });
}
```

### Using Middleware Function

```typescript
import { requireAuth } from '@/lib/middleware';

export async function DELETE(request: NextRequest) {
  // Verify and get payload, or return 401 error
  const payload = requireAuth(request);
  
  // If it's a NextResponse (error), return it
  if (payload instanceof NextResponse) {
    return payload;
  }

  // Use authenticated payload
  console.log(`Admin ${payload.email} deleted a resource`);
  return NextResponse.json({ success: true });
}
```

## Token Structure

JWT tokens contain three parts separated by dots:

```
header.payload.signature
```

**Header:**
```json
{
  "alg": "HS256",
  "typ": "JWT"
}
```

**Payload:**
```json
{
  "adminId": "507f1f77bcf86cd799439011",
  "email": "admin@college.edu",
  "name": "Administrator",
  "iat": 1706079600,
  "exp": 1706684400
}
```

**Signature:**
- Generated using JWT_SECRET
- Ensures token hasn't been tampered with

## Security Best Practices

### ✅ Do's

- ✅ Use HTTPS in production
- ✅ Store token in `localStorage` or `sessionStorage` on client
- ✅ Include token in `Authorization: Bearer <token>` header
- ✅ Verify token on every protected endpoint
- ✅ Use short expiration times (7 days or less)
- ✅ Refresh tokens before expiration
- ✅ Use strong, random JWT_SECRET
- ✅ Change JWT_SECRET in production

### ❌ Don'ts

- ❌ Store token in cookies (unless HTTP-only)
- ❌ Expose JWT_SECRET in client-side code
- ❌ Use weak or default JWT_SECRET
- ❌ Skip token verification on protected routes
- ❌ Store sensitive data in JWT (tokens can be decoded)
- ❌ Use HTTP in production
- ❌ Commit JWT_SECRET to git repository

## Token Expiration

Default expiration: **7 days**

To change:
```env
# In .env.local
JWT_EXPIRY=24h    # 24 hours
JWT_EXPIRY=30d    # 30 days
JWT_EXPIRY=1y     # 1 year
```

## Refreshing Tokens

```typescript
import { refreshToken } from '@/lib/jwt-utils';

// Get new token from existing one
const oldToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
const newToken = refreshToken(oldToken);

// Return new token to client
return NextResponse.json({ token: newToken });
```

## Troubleshooting

### Issue: "Unauthorized" on protected routes

**Solution:**
- Check Authorization header format: `Bearer <token>`
- Verify token is not expired
- Check JWT_SECRET is set in environment variables
- Ensure token was generated on same instance

### Issue: "Token verification failed"

**Solution:**
- Token may be expired - request new login
- JWT_SECRET may have changed - regenerate tokens
- Token may be malformed - check format

### Issue: CORS errors with tokens

**Solution:**
- Add `Authorization` to `Access-Control-Allow-Headers`
- Configure CORS middleware in Next.js

```typescript
// next.config.ts
async headers() {
  return [
    {
      source: '/api/:path*',
      headers: [
        { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' }
      ]
    }
  ]
}
```

## Testing with cURL

### Login
```bash
curl -X POST http://localhost:3000/api/auth/admin-login \
  -H "Content-Type: application/json" \
  -d '{
    "email":"admin@college.edu",
    "password":"Admin@123456"
  }'
```

### Verify Token
```bash
curl -X POST http://localhost:3000/api/auth/verify-token \
  -H "Authorization: Bearer <YOUR_TOKEN_HERE>"
```

### Access Protected Route
```bash
curl http://localhost:3000/api/admin/dashboard \
  -H "Authorization: Bearer <YOUR_TOKEN_HERE>"
```

### Logout
```bash
curl -X POST http://localhost:3000/api/auth/logout \
  -H "Authorization: Bearer <YOUR_TOKEN_HERE>"
```

## What's Next?

1. **Create Admin Dashboard UI** - Build React component to display dashboard data
2. **Add Cookie-based Authentication** - Option to store token in HTTP-only cookie
3. **Implement Password Reset** - Allow admins to reset forgotten passwords
4. **Add Rate Limiting** - Prevent brute force attacks on login
5. **Create Token Blacklist** - Invalidate tokens on logout
6. **Add Multi-factor Authentication** - Enhance security with 2FA

## Files Summary

| File | Purpose |
|------|---------|
| `lib/jwt-utils.ts` | JWT token generation and verification |
| `lib/middleware.ts` | Authentication middleware for protected routes |
| `app/api/auth/verify-token/route.ts` | Token verification API |
| `app/api/auth/logout/route.ts` | Logout API |
| `app/api/admin/dashboard/route.ts` | Protected route example |
| `app/api/auth/admin-login/route.ts` | Updated with token generation |
| `.env.local` | Updated with JWT configuration |

---

**Status:** ✅ JWT Authentication System Fully Implemented

Ready to use! Start by logging in to get a token, then use it to access protected routes.
