import { NextResponse } from "next/server";
import { getStaffFromRequestCookie } from "@/lib/server/staffSession";

export async function GET() {
  const staff = await getStaffFromRequestCookie();
  if (!staff) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json(staff);
}
