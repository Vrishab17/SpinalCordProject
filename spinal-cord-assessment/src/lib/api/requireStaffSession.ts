import { NextResponse } from "next/server";
import { getStaffFromRequestCookie } from "@/lib/server/staffSession";

export async function requireStaffSession() {
  const staff = await getStaffFromRequestCookie();
  if (!staff) {
    return {
      staff: null as null,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }
  return { staff, response: null as null };
}
