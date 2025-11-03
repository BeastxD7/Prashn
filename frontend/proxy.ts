import { NextRequest, NextResponse } from 'next/server';
import { isProtectedPath } from './constants/routes';

// Middleware runs on the Edge runtime. Keep logic minimal and synchronous.
export function proxy(req: NextRequest) {
  const { pathname, search } = req.nextUrl;

  // Ignore public assets and API routes early
  if (
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/static') ||
    pathname === '/favicon.ico'
  ) {
    return NextResponse.next();
  }

  // If the path is not in our protected list, allow through
  if (!isProtectedPath(pathname)) {
    return NextResponse.next();
  }

  // Check for presence of access_token cookie
  const accessCookie = req.cookies.get('access_token')?.value;
  if (accessCookie && accessCookie.length > 0) {
    // We have an access token cookie — allow the request.
    return NextResponse.next();
  }

  // No access token — redirect to login with `from` query so we can return after auth.
  const loginUrl = new URL('/login', req.nextUrl.origin);
  loginUrl.searchParams.set('from', pathname + (search || ''));

  return NextResponse.redirect(loginUrl);
}

// We only need middleware to run for protected route prefixes. This keeps middleware scope small.
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/generate/:path*',
    '/account/:path*',
    '/profile/:path*',
    '/quiz/:path*',
  ],
};
