"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Header from "@/components/layout/Header";
import { supabase } from "@/lib/supabaseClient";

type FormData = {
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

async function generateRandomPatientId() {
  for (let i = 0; i < 20; i++) {
    const randomId = Math.floor(100000 + Math.random() * 900000);

    const { data, error } = await supabase
      .from("Patient")
      .select("patient_id")
      .eq("patient_id", randomId)
      .maybeSingle();

    if (error) {
      throw new Error(`Could not validate patient_id: ${error.message}`);
    }

    if (!data) {
      return randomId;
    }
  }

  throw new Error("Could not generate a unique random patient ID.");
}

export default function ConfirmPatientContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [consent, setConsent] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [loggedInGpName, setLoggedInGpName] = useState("Not recorded");
  

  const formData: FormData | null = useMemo(() => {
    const raw = searchParams.get("data");
    if (!raw) return null;

    try {
      return JSON.parse(decodeURIComponent(raw));
    } catch {
      return null;
    }
  }, [searchParams]);

  useEffect(() => {
    const storedStaffInfo = localStorage.getItem("staffInfo");
  
    if (!storedStaffInfo) return;
  
    try {
      const parsed = JSON.parse(storedStaffInfo) as {
        username: string;
        fullName: string;
      };
  
      setLoggedInGpName(parsed.fullName || "Not recorded");
    } catch {
      setLoggedInGpName("Not recorded");
    }
  }, []);

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
      const todayDate = nowIso.split("T")[0];
  
      const patientId = await generateRandomPatientId();
      const nextNameId = await getNextId("Patient Name", "name_id");
      const nextContactId = await getNextId("Patient Contact", "contact_id");
      const nextAddressId = await getNextId("Patient Address", "address_id");
      const nextNhiIdentifierId = patientFormData.nhiNumber
        ? await getNextId("Patient NHI Identifier", "nhi_identifer_id")
        : null;
  
      const genderValue =
        patientFormData.gender === "Male"
          ? "M"
          : patientFormData.gender === "Female"
          ? "F"
          : patientFormData.gender === "Other"
          ? "O"
          : null;
  
      const fhirPatientId = `fhir-patient-${crypto.randomUUID()}`;
      console.log("=== DEBUG START ===");
      console.log("Full form data:", patientFormData);
      console.log("DOB:", patientFormData.dateOfBirth);
      console.log("Ethnicity:", patientFormData.ethnicity);
      console.log("=== DEBUG END ===");
      const { data: insertedPatient, error: patientInsertError } = await supabase
  .from("Patient")
  .insert([
    {
      patient_id: patientId,
      nhi_number: patientFormData.nhiNumber || null,
      date_of_birth: patientFormData.dateOfBirth || null,
      ethnicity: patientFormData.ethnicity || null,
      gender: genderValue,
      nz_citizenship_status: patientFormData.nzCitizenshipStatus || null,
      place_of_birth: patientFormData.placeOfBirth || null,
      date_of_death: null,
      created_at: todayDate,
      is_active: true,
      fhir_patient_id: fhirPatientId,
    },
  ])
  .select("*")
  .single();

console.log("INSERTED PATIENT:", insertedPatient);
console.log("INSERT ERROR:", patientInsertError);

if (patientInsertError) {
  throw new Error(`Patient insert failed: ${patientInsertError.message}`);
}
  
      const { error: patientNameInsertError } = await supabase
        .from("Patient Name")
        .insert([
          {
            name_id: nextNameId,
            PATIENTpatient_id: patientId,
            family_name: patientFormData.lastName || null,
            given_name: patientFormData.firstName || null,
            preffered_name: patientFormData.preferredName || null,
            prefix: patientFormData.prefix || null,
            suffix: null,
            created_at: todayDate,
            updated_at: todayDate,
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
            PATIENTpatient_id: patientId,
            email_address: patientFormData.emailAddress || null,
            home_phone_no: patientFormData.homePhoneNumber
              ? Number(patientFormData.homePhoneNumber)
              : null,
            mobile_phone_co: patientFormData.phoneNumber
              ? Number(patientFormData.phoneNumber)
              : null,
            created_at: todayDate,
            updated_at: todayDate,
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
            PATIENTpatient_id: patientId,
            type: "HOME",
            line1: patientFormData.addressLine1 || null,
            line2: patientFormData.addressLine2 || null,
            city: patientFormData.city || null,
            suburb: patientFormData.suburb || null,
            postal_code: patientFormData.postalCode
              ? Number(patientFormData.postalCode)
              : null,
            country: "NZ",
            created_at: todayDate,
            updated_at: todayDate,
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
              PATIENTpatient_id: patientId,
              nhi_number: patientFormData.nhiNumber,
              nhi_use: "official",
              assigned_at: todayDate,
              linked_at: todayDate,
              created_at: nowIso,
            },
          ]);
  
        if (patientNhiInsertError) {
          throw new Error(
            `Patient NHI Identifier insert failed: ${patientNhiInsertError.message}`
          );
        }
      }
  
      sessionStorage.removeItem("new_patient_form_data");
      router.push("/dashboard");
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

            <div>Preferred Name</div>
            <div>{patientFormData.preferredName || "Not recorded"}</div>

            <div>Prefix</div>
            <div>{patientFormData.prefix || "Not recorded"}</div>

            <div>Date of Birth</div>
            <div>{formatDisplayDate(patientFormData.dateOfBirth)}</div>

            <div>Gender</div>
            <div>{patientFormData.gender || "Not recorded"}</div>

            <div>Ethnicity</div>
            <div>{patientFormData.ethnicity || "Not recorded"}</div>

            <div>NZ Citizenship Status</div>
            <div>{patientFormData.nzCitizenshipStatus || "Not recorded"}</div>

            <div>Place of Birth</div>
            <div>{patientFormData.placeOfBirth || "Not recorded"}</div>

            <div>NHI Number</div>
            <div>{patientFormData.nhiNumber || "Not yet assigned"}</div>

            <div>Mobile Phone Number</div>
            <div>{patientFormData.phoneNumber || "Not recorded"}</div>

            <div>Home Phone Number</div>
            <div>{patientFormData.homePhoneNumber || "Not recorded"}</div>

            <div>Email Address</div>
            <div>{patientFormData.emailAddress || "Not recorded"}</div>

            <div>Admitting Clinician</div>
            <div>{loggedInGpName}</div>

            <div>Date of Admission</div>
            <div>{admissionDate}</div>

            <div>Address Line 1</div>
            <div>{patientFormData.addressLine1 || "Not recorded"}</div>

            <div>Address Line 2</div>
            <div>{patientFormData.addressLine2 || "Not recorded"}</div>

            <div>City</div>
            <div>{patientFormData.city || "Not recorded"}</div>

            <div>Suburb</div>
            <div>{patientFormData.suburb || "Not recorded"}</div>

            <div>Postal Code</div>
            <div>{patientFormData.postalCode || "Not recorded"}</div>

            <div>Date of Injury</div>
            <div>{formatDisplayDate(patientFormData.dateOfInjury)}</div>

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
              I confirm that this patient has consented to their clinical data being stored
              in the ISNCSCI assessment system, in accordance with the New Zealand Health
              Information Privacy Code 2020.
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
            onClick={() => {
              const encoded = encodeURIComponent(JSON.stringify(patientFormData));
              router.push(`/patients/new?data=${encoded}`);
            }}
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