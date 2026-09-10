import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const host = request.headers.get("host") || "";

  // Canonicalize old Vercel domain traffic to official domain
  if (host.includes("vercel.app")) {
    const targetUrl = new URL(request.url);
    targetUrl.protocol = "https:";
    targetUrl.host = "smc.onqeva.in";
    targetUrl.port = "";
    return NextResponse.redirect(targetUrl, 301);
  }

  const token = request.cookies.get("token")?.value;
  const { pathname } = request.nextUrl;

  const isProduction = process.env.NODE_ENV === "production";

  // Protect /dashboard routes in production
  if (pathname.startsWith("/dashboard")) {
    if (isProduction && !token) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // If already logged in, redirect away from /login
  if (pathname === "/login") {
    if (token) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
