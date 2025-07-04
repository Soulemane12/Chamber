import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';

export async function middleware(request: NextRequest) {
  // Create response object
  const response = NextResponse.next();

  // Create Supabase middleware client with the request context
  const supabase = createMiddlewareClient({ req: request, res: response });

  // Check the current session
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Routes that require authentication
  const protectedPaths = ['/booking', '/account'];
  const isProtectedPath = protectedPaths.some((path) =>
    request.nextUrl.pathname.startsWith(path)
  );

  if (!session && isProtectedPath) {
    // Redirect to login if unauthenticated
    const redirectUrl = new URL('/login', request.url);
    redirectUrl.searchParams.set('redirect', request.nextUrl.pathname);
    return NextResponse.redirect(redirectUrl);
  }

  return response;
}

export const config = {
  matcher: ['/booking/:path*', '/account/:path*'],
}; 