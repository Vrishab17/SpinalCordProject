import { NextResponse } from "next/server";
import { requireStaffSession } from "@/lib/api/requireStaffSession";
import { normalizeNhi } from "@/lib/nhi";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET(request: Request) {
  const auth = await requireStaffSession();
  if (auth.response) return auth.response;

  try {
    const { searchParams } = new URL(request.url);
    const nhi = normalizeNhi(searchParams.get("nhi") ?? "");
    if (!nhi) {
      return NextResponse.json({ error: "NHI is required" }, { status: 400 });
    }

    const db = getSupabaseAdmin();
    const { data: patientData, error: patientError } = await db
      .from("Patient")
      .select("*")
      .eq("nhi_number", nhi)
      .maybeSingle();

    if (patientError) throw new Error(patientError.message);
    if (!patientData) {
      return NextResponse.json({ patient: null });
    }

    const { data: nameData } = await db
      .from("Patient Name")
      .select("*")
      .eq("PATIENTpatient_id", patientData.patient_id)
      .limit(1)
      .maybeSingle();

    return NextResponse.json({
      patient: {
        ...patientData,
        name: nameData,
      },
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Patient load failed" },
      { status: 500 }
    );
  }
}
