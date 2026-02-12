import jwt, { Secret, SignOptions } from 'jsonwebtoken';

const JWT_SECRET: Secret =
  process.env.JWT_SECRET ?? 'your-super-secret-jwt-key-change-in-production';

const TOKEN_EXPIRY: SignOptions['expiresIn'] =
  (process.env.JWT_EXPIRY as SignOptions['expiresIn']) ?? '7d';

export interface JWTPayload {
  sub?: any;
  id?: string;
  adminId?: string;
  email: string;
  name?: string;
  role?: string;
}

/**
 * Generate JWT token for admin authentication
 */
export function generateToken(payload: JWTPayload): string {
  const options: SignOptions = {
    expiresIn: TOKEN_EXPIRY,
    algorithm: 'HS256',
  };

  return jwt.sign(payload, JWT_SECRET, options);
}

/**
 * Verify JWT token and extract payload
 */
export function verifyToken(token: string): JWTPayload {
  try {
    return jwt.verify(token, JWT_SECRET, {
      algorithms: ['HS256'],
    }) as JWTPayload;
  } catch (error) {
    throw new Error(
      `Token verification failed: ${
        error instanceof Error ? error.message : 'Unknown error'
      }`
    );
  }
}

/**
 * Decode token without verification (use with caution)
 */
export function decodeToken(token: string): JWTPayload | null {
  try {
    return jwt.decode(token) as JWTPayload | null;
  } catch {
    return null;
  }
}

/**
 * Extract token from authorization header
 */
export function extractTokenFromHeader(
  authHeader?: string
): string | null {
  if (!authHeader) return null;

  const [scheme, token] = authHeader.split(' ');
  if (scheme.toLowerCase() !== 'bearer' || !token) return null;

  return token;
}

/**
 * Check if token is expired
 */
export function isTokenExpired(token: string): boolean {
  try {
    const decoded = jwt.decode(token) as { exp?: number } | null;
    if (!decoded?.exp) return true;

    return decoded.exp * 1000 < Date.now();
  } catch {
    return true;
  }
}

/**
 * Refresh token by creating a new one with same payload
 */
export function refreshToken(token: string): string {
  const payload = verifyToken(token);
  return generateToken(payload);
}
