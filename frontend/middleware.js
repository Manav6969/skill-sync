import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';

export function middleware(request) {
  const token = request.cookies.get('refreshToken')?.value;

  const isProtectedRoute =
    request.nextUrl.pathname.startsWith('/dashboard') ||
    request.nextUrl.pathname.startsWith('/teams') ||
    request.nextUrl.pathname.startsWith('/skills')||
    request.nextUrl.pathname.startsWith('/chat');

  if (isProtectedRoute && !token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/teams/:path*', '/skills/:path*', '/chat/:path*'],
};
