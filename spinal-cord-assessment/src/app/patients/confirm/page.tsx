"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Header from "@/components/layout/Header";
import { supabase } from "@/lib/supabaseClient";

type FormData = {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  ethnicity: string;
  gender: string;
  phoneNumber: string;
  nhiNumber: string;
  address: string;
  dateOfInjury: string;
  injuryCause: string;
  notes: string;
};

function formatDisplayDate(dateString: string) {
  if (!dateString) return "Not recorded";

  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) return dateString;

  return new Intl.DateTimeFormat("en-NZ", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
}

async function getNextId(tableName: string, idColumn: string) {
    const { data, error } = await supabase
      .from(tableName)
      .select(idColumn)
      .order(idColumn, { ascending: false })
      .limit(1)
      .maybeSingle();
  
    if (error) {
      throw new Error(`Could not determine next ${idColumn} for ${tableName}: ${error.message}`);
    }
  
    const row = data as Record<string, unknown> | null;
    const value = row?.[idColumn];
  
    if (typeof value !== "number") {
      return 1;
    }
  
    return value + 1;
  }

export default function ConfirmPatientPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [consent, setConsent] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  const formData: FormData | null = useMemo(() => {
    const raw = searchParams.get("data");
    if (!raw) return null;

    try {
      return JSON.parse(decodeURIComponent(raw));
    } catch {
      return null;
    }
  }, [searchParams]);

  if (!formData) {
    return (
      <main
        style={{
          minHeight: "100vh",
          backgroundColor: "#F6F4EC",
        }}
      >
        <Header />
        <div
          style={{
            maxWidth: "1300px",
            margin: "0 auto",
            padding: "32px 24px",
            color: "#15284C",
          }}
        >
          No patient data provided.
        </div>
      </main>
    );
  }

  const patientFormData = formData;

  const fullName = `${patientFormData.lastName}, ${patientFormData.firstName}`;
  const admissionDate = new Intl.DateTimeFormat("en-NZ", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date());

  async function handleRegisterPatient() {
    if (!consent || saving) return;

    setSaving(true);
    setSaveError(null);
    setSaveMessage(null);

    try {
      const nowIso = new Date().toISOString();

      const nextPatientId = await getNextId("Patient", "patient_id");
      const nextNameId = await getNextId("Patient Name", "name_id");
      const nextContactId = await getNextId("Patient Contact", "contact_id");
      const nextAddressId = await getNextId("Patient Address", "address_id");

      let nextNhiIdentifierId: number | null = null;
if (patientFormData.nhiNumber) {
  nextNhiIdentifierId = await getNextId("Patient NHI Identifier", "nhi_identifer_id");
}

      const { error: patientInsertError } = await supabase.from("Patient").insert([
        {
          patient_id: nextPatientId,
          nhi_number: patientFormData.nhiNumber || null,
          date_of_birth: patientFormData.dateOfBirth || null,
          gender: patientFormData.gender || null,
          nz_citizenship_status: null,
          place_of_birth: null,
          date_of_death: null,
          created_at: nowIso,
          is_active: true,
          fhir_patient_id: null,
        },
      ]);

      if (patientInsertError) {
        throw new Error(`Patient insert failed: ${patientInsertError.message}`);
      }

      const { error: patientNameInsertError } = await supabase
  .from("Patient Name")
  .insert([
    {
      name_id: nextNameId,
      PATIENTpatient_id: nextPatientId,
      family_name: patientFormData.lastName || null,
      given_name: patientFormData.firstName || null,
      prefix: null,
      suffix: null,
      created_at: nowIso,
      updated_at: nowIso,
    },
  ]);

      if (patientNameInsertError) {
        throw new Error(`Patient Name insert failed: ${patientNameInsertError.message}`);
      }

      const { error: patientContactInsertError } = await supabase
        .from("Patient Contact")
        .insert([
          {
            contact_id: nextContactId,
            PATIENTpatient_id: nextPatientId,
            email_address: null,
            home_phone_no: null,
            mobile_phone_co: patientFormData.phoneNumber || null,
            created_at: nowIso,
            updated_at: nowIso,
          },
        ]);

      if (patientContactInsertError) {
        throw new Error(`Patient Contact insert failed: ${patientContactInsertError.message}`);
      }

      const { error: patientAddressInsertError } = await supabase
        .from("Patient Address")
        .insert([
          {
            address_id: nextAddressId,
            PATIENTpatient_id: nextPatientId,
            type: "HOME",
            line1: patientFormData.address || null,
            line2: null,
            city: null,
            suburb: null,
            postal_code: null,
            country: "NZ",
            created_at: nowIso,
            updated_at: nowIso,
          },
        ]);

      if (patientAddressInsertError) {
        throw new Error(`Patient Address insert failed: ${patientAddressInsertError.message}`);
      }

      if (patientFormData.nhiNumber && nextNhiIdentifierId !== null) {
        const { error: patientNhiInsertError } = await supabase
          .from("Patient NHI Identifier")
          .insert([
            {
                nhi_identifer_id: nextNhiIdentifierId,
                PATIENTpatient_id: nextPatientId,
                nhi_number: patientFormData.nhiNumber,
                nhi_use: "official",
                assigned_at: new Date().toISOString().split("T")[0],
                linked_at: new Date().toISOString().split("T")[0],
                created_at: nowIso,
              },
          ]);

        if (patientNhiInsertError) {
          throw new Error(`Patient NHI Identifier insert failed: ${patientNhiInsertError.message}`);
        }
      }

      setSaveMessage("Patient registered successfully.");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "An unexpected error occurred.";
      setSaveError(message);
    } finally {
      setSaving(false);
    }
  }

  function handleRegisterAndStartAssessment() {
    alert("Register & Start Assessment is not wired yet.");
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        backgroundColor: "#F6F4EC",
      }}
    >
      <Header />

      <div
        style={{
          maxWidth: "1300px",
          margin: "0 auto",
          padding: "32px 24px",
          boxSizing: "border-box",
        }}
      >
        <h1
          style={{
            fontSize: "40px",
            fontWeight: 700,
            color: "#15284C",
            margin: "0 0 24px 0",
          }}
        >
          New Patient Confirmation
        </h1>

        <div
          style={{
            backgroundColor: "#FFFFFF",
            border: "1px solid #5F6F8C",
            marginBottom: "24px",
          }}
        >
          <div
            style={{
              padding: "14px 18px",
              borderBottom: "1px solid #5F6F8C",
            }}
          >
            <h2
              style={{
                margin: 0,
                fontSize: "20px",
                fontWeight: 600,
                color: "#15284C",
              }}
            >
              Patient Summary
            </h2>
          </div>

          <div
            style={{
              padding: "20px 18px 24px 18px",
              display: "grid",
              gridTemplateColumns: "220px 1fr",
              rowGap: "10px",
              columnGap: "30px",
              color: "#15284C",
              fontSize: "14px",
            }}
          >
            <div>Full Name</div>
            <div>{fullName}</div>

            <div>Date of Birth</div>
            <div>{formatDisplayDate(patientFormData.dateOfBirth)}</div>

            <div>Gender</div>
            <div>{patientFormData.gender || "Not recorded"}</div>

            <div>NHI Number</div>
            <div>{patientFormData.nhiNumber || "Not yet assigned"}</div>

            <div>Admitting Clinician</div>
            <div>Dr. J. Doe</div>

            <div>Ward / Unit</div>
            <div>ASRU Ward 3A</div>

            <div>Date of Admission</div>
            <div>{admissionDate}</div>

            <div>Date of Injury</div>
            <div>{formatDisplayDate(patientFormData.dateOfInjury)}</div>

            <div>Ethnicity</div>
            <div>{patientFormData.ethnicity || "Not recorded"}</div>

            <div>Phone Number</div>
            <div>{patientFormData.phoneNumber || "Not recorded"}</div>

            <div>Address</div>
            <div>{patientFormData.address || "Not recorded"}</div>

            <div>Injury Cause</div>
            <div>{patientFormData.injuryCause || "Not recorded"}</div>

            <div>Notes</div>
            <div>{patientFormData.notes || "Not recorded"}</div>
          </div>
        </div>

        <div
          style={{
            backgroundColor: "#FFFFFF",
            border: "1px solid #5F6F8C",
            padding: "18px",
            marginBottom: "24px",
          }}
        >
          <div
            style={{
              fontSize: "16px",
              fontWeight: 600,
              color: "#15284C",
              marginBottom: "12px",
            }}
          >
            DATA STORAGE CONSENT
          </div>

          <label
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: "10px",
              color: "#15284C",
              fontSize: "14px",
              cursor: "pointer",
            }}
          >
            <input
              type="checkbox"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
              style={{ marginTop: "2px" }}
            />
            <span>
              I confirm that this patient has consented to their clinical data being
              stored in the ISNCSCI assessment system, in accordance with the New
              Zealand Health Information Privacy Code 2020.
            </span>
          </label>
        </div>

        {saveMessage && (
          <div
            style={{
              marginBottom: "16px",
              padding: "12px 14px",
              backgroundColor: "#ECFDF3",
              border: "1px solid #ABEFC6",
              color: "#067647",
              fontSize: "14px",
            }}
          >
            {saveMessage}
          </div>
        )}

        {saveError && (
          <div
            style={{
              marginBottom: "16px",
              padding: "12px 14px",
              backgroundColor: "#FEF3F2",
              border: "1px solid #FECDCA",
              color: "#B42318",
              fontSize: "14px",
            }}
          >
            {saveError}
          </div>
        )}

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "16px",
          }}
        >
          <button
            type="button"
            onClick={() => router.back()}
            disabled={saving}
            style={{
              minWidth: "160px",
              height: "48px",
              border: "1px solid #5F6F8C",
              backgroundColor: "#FFFFFF",
              color: "#15284C",
              fontSize: "16px",
              fontWeight: 400,
              cursor: saving ? "not-allowed" : "pointer",
              opacity: saving ? 0.6 : 1,
            }}
          >
            ← Edit
          </button>

          <div
            style={{
              display: "flex",
              gap: "16px",
              alignItems: "center",
            }}
          >
            <button
              type="button"
              disabled={!consent || saving}
              onClick={handleRegisterPatient}
              style={{
                minWidth: "170px",
                height: "48px",
                border: "1px solid #5F6F8C",
                backgroundColor: "#FFFFFF",
                color: "#15284C",
                fontSize: "16px",
                fontWeight: 400,
                cursor: !consent || saving ? "not-allowed" : "pointer",
                opacity: !consent || saving ? 0.6 : 1,
              }}
            >
              {saving ? "Registering..." : "Register Patient"}
            </button>

            <button
              type="button"
              disabled={!consent || saving}
              onClick={handleRegisterAndStartAssessment}
              style={{
                minWidth: "260px",
                height: "48px",
                border: "none",
                backgroundColor: "#2D3E5E",
                color: "#FFFFFF",
                fontSize: "16px",
                fontWeight: 600,
                cursor: !consent || saving ? "not-allowed" : "pointer",
                opacity: !consent || saving ? 0.6 : 1,
              }}
            >
              Register & Start Assessment →
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}