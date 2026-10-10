import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

const PROTECTED_PREFIXES = ["/dashboard", "/game", "/host", "/profile"];

const AUTH_ONLY_PATHS = ["/login", "/signup"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const sessionCookie = getSessionCookie(request);
  const isAuthenticated = Boolean(sessionCookie);

  // if (isAuthenticated && AUTH_ONLY_PATHS.some((p) => pathname.startsWith(p))) {
  //   return NextResponse.redirect(new URL("/dashboard", request.url));
  // }

  if (
    !isAuthenticated &&
    PROTECTED_PREFIXES.some((p) => pathname.startsWith(p))
  ) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Run on all routes except:
     * - _next/static  (static assets)
     * - _next/image   (image optimisation)
     * - favicon.ico
     * - /api/auth/*   (Better Auth endpoints must always be reachable)
     * - /api/trpc/*   (tRPC — auth is enforced per-procedure, not at the edge)
     */
    "/((?!_next/static|_next/image|favicon.ico|api/auth|api/trpc).*)",
  ],
};
