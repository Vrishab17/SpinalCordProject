import { NextResponse } from "next/server";
import { requireStaffSession } from "@/lib/api/requireStaffSession";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import {
  registerPatientOnServer,
  type RegisterPatientPayload,
} from "@/lib/server/registerPatient";

export async function POST(request: Request) {
  const auth = await requireStaffSession();
  if (auth.response) return auth.response;

  try {
    const body = (await request.json()) as RegisterPatientPayload;
    const db = getSupabaseAdmin();
    const result = await registerPatientOnServer(db, auth.staff!.staffId, body);
    return NextResponse.json(result);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Registration failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
