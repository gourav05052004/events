import { NextRequest, NextResponse } from 'next/server';
import { verifyRequestToken } from '@/lib/middleware';

/**
 * POST /api/auth/logout
 * Logout admin - client should discard token
 * 
 * Note: Since we use stateless JWT tokens, logout is primarily
 * for client-side cleanup. The client must:
 * 1. Discard the token
 * 2. Clear any session storage
 * 3. Redirect to login
 */
export async function POST(request: NextRequest) {
  try {
    // Verify token exists
    const payload = verifyRequestToken(request);
    if (!payload) {
      return NextResponse.json(
        { error: 'Not logged in' },
        { status: 401 }
      );
    }

    // Token is valid, instruct client to logout
    return NextResponse.json(
      {
        message: 'Logout successful',
        instruction: 'Please clear your token from storage and redirect to login',
      },
      {
        status: 200,
        headers: {
          'Clear-Site-Data': '"cookies", "storage"',
        },
      }
    );
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { message: 'Logout completed' },
      { status: 200 }
    );
  }
}

/**
 * GET /api/auth/logout
 * Alternative logout endpoint
 */
export async function GET() {
  return NextResponse.json(
    {
      message: 'Use POST to logout',
      instruction: 'Send POST request to /api/auth/logout with valid token in Authorization header',
    },
    { status: 405 }
  );
}
