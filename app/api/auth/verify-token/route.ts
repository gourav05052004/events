import { NextRequest, NextResponse } from 'next/server';
import { verifyRequestToken } from '@/lib/middleware';

/**
 * POST /api/auth/verify-token
 * Verify if JWT token is valid
 * 
 * Request:
 *   - Authorization: Bearer <token>
 * 
 * Response (200):
 *   {
 *     "valid": true,
 *     "payload": {
 *       "adminId": "...",
 *       "email": "...",
 *       "name": "..."
 *     }
 *   }
 * 
 * Response (401):
 *   { "error": "Invalid or expired token" }
 */
export async function POST(request: NextRequest) {
  try {
    const payload = verifyRequestToken(request);

    if (!payload) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      {
        valid: true,
        payload,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Token verification error:', error);
    return NextResponse.json(
      { error: 'Invalid or expired token' },
      { status: 401 }
    );
  }
}

/**
 * GET /api/auth/verify-token
 * Alternative GET endpoint to verify token
 */
export async function GET(request: NextRequest) {
  try {
    const payload = verifyRequestToken(request);

    if (!payload) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      {
        valid: true,
        payload,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Token verification error:', error);
    return NextResponse.json(
      { error: 'Invalid or expired token' },
      { status: 401 }
    );
  }
}
