import { NextResponse, type NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect admin routes
  if (pathname.startsWith('/admin')) {
    const adminToken = request.cookies.get('admin_token')?.value;
    if (!adminToken) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = '/login';
      loginUrl.searchParams.set('role', 'admin');
      return NextResponse.redirect(loginUrl);
    }
  }

  // Protect club routes
  if (pathname.startsWith('/club')) {
    const clubToken = request.cookies.get('club_token')?.value;
    if (!clubToken) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = '/login';
      loginUrl.searchParams.set('role', 'club');
      return NextResponse.redirect(loginUrl);
    }
  }

  // Protect student routes
  if (pathname.startsWith('/student')) {
    const studentToken = request.cookies.get('student_token')?.value;
    if (!studentToken) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = '/login';
      loginUrl.searchParams.set('role', 'student');
      return NextResponse.redirect(loginUrl);
    }
  }

  // Note: /event/* pages are now public - users can view but need login to register

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/club/:path*', '/student/:path*'],
};
