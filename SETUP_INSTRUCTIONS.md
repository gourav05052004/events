# 🔧 Environment Setup & First Steps

## 1️⃣ Create `.env.local` File

```bash
# Copy the example file
cp .env.example .env.local
```

## 2️⃣ Configure MongoDB Connection

Edit `.env.local` and choose one:

### Option A: MongoDB Atlas (Cloud - Recommended)

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create account and free cluster
3. Create database user
4. Get connection string from "Connect" button
5. Replace in `.env.local`:

```
MONGODB_URI=mongodb+srv://username:password@cluster0.mongodb.net/event_management?retryWrites=true&w=majority
```

### Option B: Local MongoDB

If you have MongoDB installed locally:

```
MONGODB_URI=mongodb://localhost:27017/event_management
```

### Option C: MongoDB Cloud (Free Tier)

```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/event_management?retryWrites=true&w=majority
```

## 3️⃣ Verify Connection (Optional)

Create a test API route:

```typescript
// app/api/test/route.ts
import connectDB from '@/lib/db';
import { Admin } from '@/models';

export async function GET() {
  try {
    await connectDB();
    const count = await Admin.countDocuments();
    
    return Response.json({
      status: 'connected',
      adminCount: count,
      message: 'MongoDB connection successful!',
    });
  } catch (error) {
    return Response.json({
      status: 'error',
      error: (error as Error).message,
    }, { status: 500 });
  }
}
```

Then visit: `http://localhost:3000/api/test`

## 4️⃣ Install Password Hashing (Recommended)

For secure password storage:

```bash
npm install bcrypt
npm install --save-dev @types/bcrypt
```

## 5️⃣ Create Authentication Utilities

```typescript
// lib/auth.ts
import { hash, compare } from 'bcrypt';

export async function hashPassword(password: string): Promise<string> {
  return hash(password, 10);
}

export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return compare(password, hash);
}
```

## 6️⃣ Create First API Route

```typescript
// app/api/students/route.ts
import connectDB from '@/lib/db';
import { Student } from '@/models';
import { hashPassword } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    await connectDB();
    const body = await request.json();

    // Hash password
    const password_hash = await hashPassword(body.password);

    // Create student
    const student = await Student.create({
      name: body.name,
      email: body.email,
      password_hash,
      roll_number: body.roll_number,
      department: body.department,
      batch: body.batch,
    });

    return Response.json(student, { status: 201 });
  } catch (error) {
    return Response.json(
      { error: (error as Error).message },
      { status: 400 }
    );
  }
}

export async function GET() {
  try {
    await connectDB();
    const students = await Student.find();
    return Response.json(students);
  } catch (error) {
    return Response.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
```

## 7️⃣ Add Validation with Zod

```bash
npm install zod
```

```typescript
// lib/schemas.ts
import { z } from 'zod';

export const StudentSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(6),
  roll_number: z.string(),
  department: z.string(),
  batch: z.string(),
});

export type StudentInput = z.infer<typeof StudentSchema>;
```

## 8️⃣ Update API Route with Validation

```typescript
// app/api/students/route.ts
import { StudentSchema } from '@/lib/schemas';

export async function POST(request: Request) {
  try {
    await connectDB();
    const body = await request.json();

    // Validate
    const validData = StudentSchema.parse(body);

    // Hash password
    const password_hash = await hashPassword(validData.password);

    // Create
    const student = await Student.create({
      ...validData,
      password_hash,
    });

    return Response.json(student, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json(
        { errors: error.errors },
        { status: 400 }
      );
    }
    return Response.json(
      { error: (error as Error).message },
      { status: 400 }
    );
  }
}
```

## 9️⃣ Implement JWT Authentication

```bash
npm install jsonwebtoken
npm install --save-dev @types/jsonwebtoken
```

```typescript
// lib/jwt.ts
import jwt from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET || 'your-secret-key';

export function generateToken(payload: any): string {
  return jwt.sign(payload, SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): any {
  try {
    return jwt.verify(token, SECRET);
  } catch {
    throw new Error('Invalid token');
  }
}
```

```typescript
// lib/middleware.ts
import { verifyToken } from './jwt';

export async function authenticate(request: Request) {
  const token = request.headers.get('Authorization')?.split(' ')[1];
  
  if (!token) {
    throw new Error('No token provided');
  }
  
  return verifyToken(token);
}
```

## 🔟 Create Protected Route Example

```typescript
// app/api/admin/dashboard/route.ts
import { authenticate } from '@/lib/middleware';
import connectDB from '@/lib/db';
import { Event } from '@/models';

export async function GET(request: Request) {
  try {
    // Verify authentication
    const user = await authenticate(request);
    
    if (user.role !== 'admin') {
      return Response.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    await connectDB();

    const stats = {
      totalEvents: await Event.countDocuments(),
      pendingEvents: await Event.countDocuments({ status: 'PENDING' }),
      approvedEvents: await Event.countDocuments({ status: 'APPROVED' }),
    };

    return Response.json(stats);
  } catch (error) {
    return Response.json(
      { error: (error as Error).message },
      { status: 401 }
    );
  }
}
```

## 📋 Directory Structure After Setup

```
app/
├── api/
│   ├── test/
│   │   └── route.ts              (Connection test)
│   ├── auth/
│   │   └── login/
│   │       └── route.ts          (Authentication)
│   ├── students/
│   │   └── route.ts              (CRUD)
│   ├── clubs/
│   │   └── route.ts
│   ├── events/
│   │   └── route.ts
│   └── admin/
│       └── dashboard/
│           └── route.ts          (Protected route)
│
lib/
├── db.ts                          (Connection)
├── db-helpers.ts                  (Utilities)
├── auth.ts                        (Password hashing)
├── jwt.ts                         (Token generation)
├── middleware.ts                  (Authentication)
├── schemas.ts                     (Zod validation)
└── utils.ts
│
models/
├── Admin.ts
├── Club.ts
├── Student.ts
├── Resource.ts
├── Event.ts
├── EventClub.ts
├── EventRegistration.ts
├── Team.ts
├── TeamMember.ts
├── EventSlot.ts
├── ActivityLog.ts
└── index.ts
│
.env.local                         (Local secrets - DON'T COMMIT)
.env.example                       (Template)
```

## ⚠️ Important Reminders

1. **Never commit `.env.local`** - Should already be in `.gitignore`
2. **Change JWT_SECRET** in production
3. **Use HTTPS** in production
4. **Implement CORS** if frontend is separate domain
5. **Add rate limiting** for public endpoints
6. **Validate all inputs** with Zod
7. **Hash all passwords** with bcrypt
8. **Log security events**

## 🧪 Testing Your Setup

### Create a Test Student

```bash
curl -X POST http://localhost:3000/api/students \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@college.edu",
    "password": "password123",
    "roll_number": "CS001",
    "department": "Computer Science",
    "batch": "2024"
  }'
```

### Get All Students

```bash
curl http://localhost:3000/api/students
```

### Test Connection

```bash
curl http://localhost:3000/api/test
```

## 🚀 Development Workflow

1. **Create schema validation** (lib/schemas.ts)
2. **Create API route** (app/api/route.ts)
3. **Add authentication** if needed
4. **Test with curl or Postman**
5. **Add error handling**
6. **Update models if needed**
7. **Document endpoint**

## 📚 Useful Tools

- **Postman**: API testing
- **MongoDB Compass**: Database visualization
- **Thunder Client**: VSCode API testing
- **REST Client**: VSCode extension for API testing

## 🎯 Next Actions

1. ✅ Create `.env.local`
2. ✅ Add MongoDB URI
3. ✅ Test connection with `/api/test`
4. ✅ Install bcrypt for passwords
5. ✅ Create first CRUD API
6. ✅ Add Zod validation
7. ✅ Implement JWT auth
8. ✅ Build admin dashboard

---

**Ready to start building? Let's go! 🚀**
