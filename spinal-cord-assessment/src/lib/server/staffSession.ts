import { cookies } from "next/headers";
import type { StaffInfo } from "@/lib/auth";

export const STAFF_SESSION_COOKIE = "sca_staff_session";

export function staffSessionCookieOptions(maxAgeSeconds = 60 * 60 * 12) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: maxAgeSeconds,
  };
}

export async function getStaffFromRequestCookie(): Promise<StaffInfo | null> {
  const jar = await cookies();
  const raw = jar.get(STAFF_SESSION_COOKIE)?.value;
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as StaffInfo;
    if (
      typeof parsed.staffId === "number" &&
      typeof parsed.username === "string"
    ) {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
}

export function staffSessionJson(staff: StaffInfo): string {
  return JSON.stringify({
    username: staff.username,
    fullName: staff.fullName,
    staffId: staff.staffId,
  });
}
