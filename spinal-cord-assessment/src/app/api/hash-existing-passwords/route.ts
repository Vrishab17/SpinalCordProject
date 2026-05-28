import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

function isBcryptHash(value: string | null | undefined) {
  return (
    typeof value === "string" &&
    (value.startsWith("$2a$") ||
      value.startsWith("$2b$") ||
      value.startsWith("$2y$"))
  );
}

export async function GET() {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("Staff Credentials")
      .select("username, password_hash");

    if (error || !data) {
      return NextResponse.json(
        { ok: false, error: error?.message ?? "Could not read credentials" },
        { status: 500 }
      );
    }

    const hashedUsernames: string[] = [];
    const skippedUsernames: string[] = [];

    for (const staff of data) {
      if (isBcryptHash(staff.password_hash)) {
        skippedUsernames.push(staff.username);
        continue;
      }

      if (!staff.password_hash) {
        skippedUsernames.push(staff.username);
        continue;
      }

      const hashedPassword = await bcrypt.hash(staff.password_hash, 10);

      const { error: updateError } = await supabase
        .from("Staff Credentials")
        .update({ password_hash: hashedPassword })
        .eq("username", staff.username);

      if (updateError) {
        return NextResponse.json(
          { ok: false, error: updateError.message },
          { status: 500 }
        );
      }

      hashedUsernames.push(staff.username);
    }

    return NextResponse.json({
      ok: true,
      scanned: data.length,
      hashed: hashedUsernames.length,
      skipped: skippedUsernames.length,
      usernames: {
        hashed: hashedUsernames,
        skipped: skippedUsernames,
      },
    });
  } catch (e) {
    return NextResponse.json(
      {
        ok: false,
        error: e instanceof Error ? e.message : "Password hashing failed",
      },
      { status: 500 }
    );
  }
}
