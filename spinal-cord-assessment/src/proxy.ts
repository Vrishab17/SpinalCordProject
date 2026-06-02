import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { STAFF_SESSION_COOKIE } from "@/lib/server/staffSession";

const PROTECTED_PREFIXES = [
  "/dashboard",
  "/search",
  "/assessment",
  "/history",
  "/patients",
];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtected = PROTECTED_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  );

  if (!isProtected) {
    return NextResponse.next();
  }

  const session = request.cookies.get(STAFF_SESSION_COOKIE)?.value;
  if (!session) {
    const login = new URL("/login", request.url);
    login.searchParams.set("next", pathname);
    return NextResponse.redirect(login);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/search/:path*",
    "/assessment/:path*",
    "/history/:path*",
    "/patients/:path*",
  ],
};
