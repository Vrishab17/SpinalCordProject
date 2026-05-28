import { NextResponse } from "next/server";
import { STAFF_SESSION_COOKIE, staffSessionCookieOptions } from "@/lib/server/staffSession";

export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(STAFF_SESSION_COOKIE, "", { ...staffSessionCookieOptions(0), maxAge: 0 });
  return res;
}
