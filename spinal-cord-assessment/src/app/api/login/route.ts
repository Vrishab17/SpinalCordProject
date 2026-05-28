import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import {
  STAFF_SESSION_COOKIE,
  staffSessionCookieOptions,
  staffSessionJson,
} from "@/lib/server/staffSession";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("Staff Credentials")
      .select("username, password_hash, STAFFstaff_id")
      .eq("username", username)
      .maybeSingle();

    if (error || !data) {
      return NextResponse.json(
        { error: "Invalid username or password" },
        { status: 401 }
      );
    }

    const passwordMatches = await bcrypt.compare(password, data.password_hash);

    if (!passwordMatches) {
      return NextResponse.json(
        { error: "Invalid username or password" },
        { status: 401 }
      );
    }

    const { data: nameData } = await supabase
      .from("Staff Name")
      .select("prefix, given_name, preferred_name, family_name")
      .eq("STAFFstaff_id", data.STAFFstaff_id)
      .maybeSingle();

    const firstName = nameData?.preferred_name || nameData?.given_name || "";

    const fullName = [
      nameData?.prefix,
      firstName,
      nameData?.family_name,
    ]
      .filter(Boolean)
      .join(" ");

    const staff = {
      username: data.username,
      staffId: data.STAFFstaff_id as number,
      fullName,
    };

    const res = NextResponse.json(staff);
    res.cookies.set(
      STAFF_SESSION_COOKIE,
      staffSessionJson(staff),
      staffSessionCookieOptions()
    );
    return res;
  } catch {
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}