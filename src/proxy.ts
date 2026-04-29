import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Izinkan akses ke halaman login-pin, login admin, dan api
  if (
    pathname.startsWith("/login-pin") ||
    pathname.startsWith("/login-admin") ||
    pathname.startsWith("/api") ||
    pathname.includes(".") // static files
  ) {
    return NextResponse.next();
  }

  // Cek cookie PIN_AUTH
  const pinAuth = request.cookies.get("PIN_AUTH");

  if (!pinAuth) {
    // Redirect ke halaman login PIN jika tidak ada cookie
    return NextResponse.redirect(new URL("/login-pin", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
