import type { SupabaseClient } from "@supabase/supabase-js";
import { normalizeNhi } from "@/lib/nhi";
import { writeAuditLog } from "./auditLog";
import { upsertPatientInjury, type PatientInjuryInput } from "./patientInjury";

export type RegisterPatientPayload = {
  firstName: string;
  lastName: string;
  preferredName: string;
  prefix: string;
  dateOfBirth: string;
  ethnicity: string;
  gender: string;
  nzCitizenshipStatus: string;
  placeOfBirth: string;
  phoneNumber: string;
  homePhoneNumber: string;
  emailAddress: string;
  nhiNumber: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  suburb: string;
  postalCode: string;
  dateOfInjury: string;
  reviewDate: string;
  injuryCause: string;
  notes: string;
};

function genderToDb(gender: string): string | null {
  if (gender === "Male") return "M";
  if (gender === "Female") return "F";
  if (gender === "Other") return "O";
  return null;
}

export async function registerPatientOnServer(
  db: SupabaseClient,
  staffId: number,
  payload: RegisterPatientPayload
): Promise<{ patientId: number; nhi: string }> {
  const normalizedNhi = normalizeNhi(payload.nhiNumber);
  if (!normalizedNhi) {
    throw new Error("NHI number is required.");
  }

  const { data: existing } = await db
    .from("Patient")
    .select("patient_id")
    .eq("nhi_number", normalizedNhi)
    .maybeSingle();

  if (existing?.patient_id) {
    throw new Error(`A patient with NHI ${normalizedNhi} already exists.`);
  }

  const nowIso = new Date().toISOString();
  const todayDate = nowIso.slice(0, 10);
  const fhirPatientId = `fhir-patient-${crypto.randomUUID()}`;

  const { data: patientRow, error: patientErr } = await db
    .from("Patient")
    .insert({
      nhi_number: normalizedNhi,
      date_of_birth: payload.dateOfBirth || null,
      ethnicity: payload.ethnicity || null,
      gender: genderToDb(payload.gender),
      nz_citizenship_status: payload.nzCitizenshipStatus || null,
      place_of_birth: payload.placeOfBirth || null,
      date_of_death: null,
      created_at: todayDate,
      is_active: "true",
      fhir_patient_id: fhirPatientId,
    })
    .select("patient_id")
    .single();

  if (patientErr || !patientRow?.patient_id) {
    throw new Error(
      `Patient insert failed: ${patientErr?.message ?? "unknown error"}`
    );
  }

  const patientId = patientRow.patient_id as number;

  const { error: nameErr } = await db.from("Patient Name").insert({
    PATIENTpatient_id: patientId,
    family_name: payload.lastName || null,
    given_name: payload.firstName || null,
    preferred_name: payload.preferredName || null,
    prefix: payload.prefix || null,
    suffix: null,
    created_at: todayDate,
    updated_at: todayDate,
  });
  if (nameErr) {
    throw new Error(`Patient Name insert failed: ${nameErr.message}`);
  }

  const { error: contactErr } = await db.from("Patient Contact").insert({
    PATIENTpatient_id: patientId,
    email_address: payload.emailAddress || null,
    home_phone_no: payload.homePhoneNumber?.trim() || null,
    mobile_phone_co: payload.phoneNumber?.trim() || null,
    created_at: todayDate,
    updated_at: todayDate,
  });
  if (contactErr) {
    throw new Error(`Patient Contact insert failed: ${contactErr.message}`);
  }

  const { error: addressErr } = await db.from("Patient Address").insert({
    PATIENTpatient_id: patientId,
    type: "HOME",
    line1: payload.addressLine1 || null,
    line2: payload.addressLine2 || null,
    city: payload.city || null,
    suburb: payload.suburb || null,
    postal_code: payload.postalCode ? Number(payload.postalCode) : null,
    country: "NZ",
    created_at: todayDate,
    updated_at: todayDate,
  });
  if (addressErr) {
    throw new Error(`Patient Address insert failed: ${addressErr.message}`);
  }

  const { error: nhiErr } = await db.from("Patient NHI Identifier").insert({
    PATIENTpatient_id: patientId,
    nhi_number: normalizedNhi,
    nhi_use: "official",
    assigned_at: todayDate,
    linked_at: todayDate,
    created_at: nowIso,
  });
  if (nhiErr) {
    throw new Error(`Patient NHI Identifier insert failed: ${nhiErr.message}`);
  }

  const injuryInput: PatientInjuryInput = {
    injuryDate: payload.dateOfInjury,
    reviewDate: payload.reviewDate,
    injuryCause: payload.injuryCause,
    notes: payload.notes,
  };
  await upsertPatientInjury(db, { patientId, staffId, injury: injuryInput });

  await writeAuditLog(db, {
    entityType: "Patient",
    entityId: String(patientId),
    action: "patient.register",
    staffId,
    details: { nhi: normalizedNhi },
  });

  return { patientId, nhi: normalizedNhi };
}
