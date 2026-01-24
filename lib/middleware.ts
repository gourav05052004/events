import { verifyToken, extractTokenFromHeader } from './jwt-utils';
import { NextRequest, NextResponse } from 'next/server';

/**
 * Middleware to verify JWT token from request
 * @param request - Next.js request object
 * @returns Decoded token payload or null if invalid
 */
export function verifyRequestToken(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const token = extractTokenFromHeader(authHeader);

  if (!token) {
    return null;
  }

  try {
    return verifyToken(token);
  } catch {
    return null;
  }
}

/**
 * Protected route handler - returns error if token is invalid
 * @param request - Next.js request object
 * @returns Response with 401 error if no valid token
 */
export function requireAuth(request: NextRequest) {
  const payload = verifyRequestToken(request);

  if (!payload) {
    return NextResponse.json(
      { error: 'Unauthorized - Valid token required' },
      { status: 401 }
    );
  }

  return payload;
}

/**
 * Get authorization header value
 * @param request - Next.js request object
 * @returns Authorization header value or null
 */
export function getAuthHeader(request: NextRequest): string | null {
  return request.headers.get('authorization');
}
