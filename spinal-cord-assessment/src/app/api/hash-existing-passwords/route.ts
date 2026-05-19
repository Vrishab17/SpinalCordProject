import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { supabase } from "@/lib/supabaseClient";

export async function GET() {
  const { data, error } = await supabase
    .from("Staff Credentials")
    .select("username, password_hash");

  if (error || !data) {
    return NextResponse.json({ error: error?.message }, { status: 500 });
  }

  for (const staff of data) {
    if (staff.password_hash.startsWith("$2a$") || staff.password_hash.startsWith("$2b$")) {
      continue;
    }

    const hashedPassword = await bcrypt.hash(staff.password_hash, 10);

    const { error: updateError } = await supabase
      .from("Staff Credentials")
      .update({ password_hash: hashedPassword })
      .eq("username", staff.username);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }
  }

  return NextResponse.json({ message: "Passwords hashed successfully" });
}