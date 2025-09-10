import { NextResponse } from 'next/server';

export function middleware(request) {
  let token = request.cookies.get('refreshToken')?.value;
  console.log(token);

   if (token && token.startsWith('Bearer ')) {
    token = token.slice(7);
  }

  const isProtectedRoute =
    request.nextUrl.pathname.startsWith('/dashboard') ||
    request.nextUrl.pathname.startsWith('/teams') ||
    request.nextUrl.pathname.startsWith('/skills') ||
    request.nextUrl.pathname.startsWith('/chat');
  
  if (isProtectedRoute && !token) {
    const redirectResponse = NextResponse.redirect(new URL('/signup', request.url));
    redirectResponse.headers.set('x-middleware-cache', 'no-cache');
    return redirectResponse;
  }

  const response = NextResponse.next();
  response.headers.set('x-middleware-cache', 'no-cache');
  return response;
}

export const config = {
  matcher: ['/dashboard/:path*', '/teams/:path*', '/skills/:path*', '/chat/:path*'],
};
