import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

const PROTECTED = ["/dashboard", "/host"];

const AUTH_ONLY = ["/login", "/signup"];

export function middleware(request: NextRequest) {
  // const { pathname } = request.nextUrl;
  // const isAuthenticated = Boolean(getSessionCookie(request));

  // if (isAuthenticated && AUTH_ONLY.some((p) => pathname.startsWith(p))) {
  //   return NextResponse.redirect(new URL("/dashboard", request.url));
  // }

  // if (!isAuthenticated && PROTECTED.some((p) => pathname.startsWith(p))) {
  //   const url = new URL("/login", request.url);
  //   url.searchParams.set("next", pathname);
  //   return NextResponse.redirect(url);
  // }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/).*)"],
};
