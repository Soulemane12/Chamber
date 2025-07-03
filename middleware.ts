import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";

export async function middleware(request: NextRequest) {
  const response = NextResponse.next();
  const supabase = createMiddlewareClient({ req: request, res: response });
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const { pathname } = request.nextUrl;

  const isAuthRoute = pathname.startsWith("/login") || pathname.startsWith("/signup");

  // Root path behaviour
  if (pathname === "/") {
    if (session && session.user) {
      const bookingUrl = request.nextUrl.clone();
      bookingUrl.pathname = "/booking";
      return NextResponse.redirect(bookingUrl);
    }
    const signupUrl = request.nextUrl.clone();
    signupUrl.pathname = "/signup";
    return NextResponse.redirect(signupUrl);
  }

  if ((!session || !session.user) && !isAuthRoute && !pathname.startsWith("/api")) {
    const signupUrl = request.nextUrl.clone();
    signupUrl.pathname = "/signup";
    return NextResponse.redirect(signupUrl);
  }

  if (session && session.user && isAuthRoute) {
    const bookingUrl = request.nextUrl.clone();
    bookingUrl.pathname = "/booking";
    return NextResponse.redirect(bookingUrl);
  }

  return response;
}

export const config = {
  matcher: ["/(.*)"]
}; 