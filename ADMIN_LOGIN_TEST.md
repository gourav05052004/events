# 🔑 Admin Login - Quick Test Guide

## ✅ Admin Account Created!

Your admin account has been successfully created in MongoDB with the following credentials:

```
📋 Email:    admin@college.edu
🔐 Password: Admin@123456
```

## 🧪 Test the Login API

### Option 1: Using cURL

Open a terminal and run:

```bash
curl -X POST http://localhost:3000/api/auth/admin-login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@college.edu",
    "password": "Admin@123456"
  }'
```

**Expected Response:**
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

### Option 2: Using Postman

1. Open Postman
2. Create new request
3. Select **POST** method
4. Enter URL: `http://localhost:3000/api/auth/admin-login`
5. Go to **Body** tab
6. Select **raw** and **JSON**
7. Enter:
```json
{
  "email": "admin@college.edu",
  "password": "Admin@123456"
}
```
8. Click **Send**

### Option 3: Using VS Code REST Client Extension

Create a file named `test-login.http`:

```http
POST http://localhost:3000/api/auth/admin-login
Content-Type: application/json

{
  "email": "admin@college.edu",
  "password": "Admin@123456"
}
```

Click "Send Request" above the POST line.

## 📁 MongoDB Database Storage

Your admin credentials are securely stored in MongoDB:

**Collection:** `admins`

**Document Structure:**
```javascript
{
  _id: ObjectId("507f1f77bcf86cd799439011"),
  name: "Administrator",
  email: "admin@college.edu",
  password_hash: "$2a$10$...", // Bcrypt hashed password
  created_at: ISODate("2026-01-24T10:30:00Z")
}
```

**Note:** The password is never stored in plain text. It's hashed using bcryptjs with 10 salt rounds.

## 🔐 Security Features

✅ **Password Hashing** - Using bcryptjs (10 rounds)
✅ **Unique Email** - Only one admin per email
✅ **Input Validation** - Email and password validation
✅ **Error Handling** - Generic error messages for security
✅ **MongoDB Storage** - Secure database storage

## 📝 API Details

### Login Endpoint

**URL:** `/api/auth/admin-login`
**Method:** POST
**Content-Type:** application/json

**Request Body:**
```json
{
  "email": "string (required)",
  "password": "string (required)"
}
```

**Success Response (200):**
```json
{
  "message": "Login successful",
  "admin": {
    "id": "string",
    "name": "string",
    "email": "string",
    "created_at": "ISO date string"
  }
}
```

**Error Responses:**
- 400: Missing email or password
- 401: Invalid credentials
- 500: Server error

### Register Endpoint

**URL:** `/api/auth/admin-register`
**Method:** POST
**Content-Type:** application/json

**Request Body:**
```json
{
  "name": "string (required)",
  "email": "string (required)",
  "password": "string (min 6 chars)"
}
```

**Success Response (201):**
```json
{
  "message": "Admin registered successfully",
  "admin": {
    "id": "string",
    "name": "string",
    "email": "string"
  }
}
```

## 🚀 Next Steps

1. **Test Login** - Use credentials to login
2. **Change Password** - Create endpoint to update password
3. **Add JWT Token** - Generate tokens for sessions
4. **Create Protected Routes** - Use tokens for admin-only routes
5. **Add Logout** - Invalidate sessions

## 📚 Related Files

- [ADMIN_LOGIN_GUIDE.md](ADMIN_LOGIN_GUIDE.md) - Complete setup guide
- [lib/auth-utils.ts](lib/auth-utils.ts) - Password hashing functions
- [app/api/auth/admin-login/route.ts](app/api/auth/admin-login/route.ts) - Login API
- [app/api/auth/admin-register/route.ts](app/api/auth/admin-register/route.ts) - Register API
- [scripts/seed-admin.js](scripts/seed-admin.js) - Admin seeding script

## ⚠️ Important Notes

- **Default Credentials** - Change password after first login
- **Environment Variables** - Keep `.env.local` secret (don't commit!)
- **Password Security** - Use strong passwords in production
- **MongoDB Connection** - Verify connection is working
- **HTTPS** - Use HTTPS in production

## 🎯 Database Location

Your admin data is stored in:

```
MongoDB Atlas
├── Cluster: cluster0
├── Database: event_management
└── Collection: admins
    └── Document: {email: "admin@college.edu"}
```

---

**Status**: ✅ Admin account created and ready to use!

Try logging in now: `npm run dev` then test the API! 🚀
