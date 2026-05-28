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
    const { data: patientRow, error } = await db
      .from("Patient")
      .select("patient_id,nhi_number,date_of_birth,gender")
      .eq("nhi_number", nhi)
      .maybeSingle();

    if (error) throw new Error(error.message);
    if (!patientRow) {
      return NextResponse.json({ patient: null });
    }

    const [{ data: nameData }, { data: gpData }] = await Promise.all([
      db
        .from("Patient Name")
        .select("given_name,family_name")
        .eq("PATIENTpatient_id", patientRow.patient_id)
        .limit(1)
        .maybeSingle(),
      db
        .from("GP Enrollment")
        .select("hpi_practitioner_id")
        .eq("PATIENTpatient_id", patientRow.patient_id)
        .limit(1)
        .maybeSingle(),
    ]);

    const fullName =
      nameData && (nameData.given_name || nameData.family_name)
        ? `${nameData.given_name ?? ""} ${nameData.family_name ?? ""}`.trim()
        : "Unknown";

    return NextResponse.json({
      patient: {
        id: patientRow.patient_id,
        name: fullName,
        nhi: patientRow.nhi_number,
        dob: patientRow.date_of_birth,
        gender: patientRow.gender ?? "—",
        gp: gpData?.hpi_practitioner_id ?? "Not assigned",
      },
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Patient search failed" },
      { status: 500 }
    );
  }
}
