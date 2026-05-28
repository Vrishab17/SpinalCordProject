"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/layout/Header";
import type { NewPatientFormData } from "@/components/patients/NewPatientForm";
import { getLoggedInStaff } from "@/lib/auth";
import {
  clearNewPatientFormData,
  readNewPatientFormData,
  writeNewPatientFormData,
} from "@/lib/newPatientStorage";

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

export default function ConfirmPatientContent() {
  const router = useRouter();
  const [formData, setFormData] = useState<NewPatientFormData | null>(null);
  const [consent, setConsent] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [loggedInGpName, setLoggedInGpName] = useState("Not recorded");

  useEffect(() => {
    setFormData(readNewPatientFormData());
    const staff = getLoggedInStaff();
    if (staff?.fullName) setLoggedInGpName(staff.fullName);
  }, []);

  if (!formData) {
    return (
      <main style={{ minHeight: "100vh", backgroundColor: "#F6F4EC" }}>
        <Header />
        <div
          style={{
            maxWidth: "1300px",
            margin: "0 auto",
            padding: "32px 24px",
            color: "#15284C",
          }}
        >
          <p>No patient data in session. Complete the new patient form first.</p>
          <button
            type="button"
            onClick={() => router.push("/patients/new")}
            style={{
              marginTop: 16,
              padding: "10px 18px",
              border: "1px solid #5F6F8C",
              background: "#fff",
              cursor: "pointer",
            }}
          >
            Go to New Patient form
          </button>
        </div>
      </main>
    );
  }

  const fullName = `${formData.lastName}, ${formData.firstName}`;
  const admissionDate = new Intl.DateTimeFormat("en-NZ", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date());

  async function registerViaApi(): Promise<{ nhi: string }> {
    const res = await fetch("/api/patients/register", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });
    const body = (await res.json()) as { nhi?: string; error?: string };
    if (!res.ok) {
      throw new Error(body.error ?? "Registration failed");
    }
    if (!body.nhi) throw new Error("Registration succeeded but NHI was missing.");
    return { nhi: body.nhi };
  }

  async function handleRegisterPatient() {
    if (!consent || saving) return;
    setSaving(true);
    setSaveError(null);
    try {
      await registerViaApi();
      clearNewPatientFormData();
      router.push("/dashboard");
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : "Registration failed.");
    } finally {
      setSaving(false);
    }
  }

  async function handleRegisterAndStartAssessment() {
    if (!consent || saving) return;
    setSaving(true);
    setSaveError(null);
    try {
      const { nhi } = await registerViaApi();
      clearNewPatientFormData();
      router.push(`/assessment?nhi=${encodeURIComponent(nhi)}`);
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : "Registration failed.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main style={{ minHeight: "100vh", backgroundColor: "#F6F4EC" }}>
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
            <h2 style={{ margin: 0, fontSize: "20px", fontWeight: 600, color: "#15284C" }}>
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
            <div>{formData.preferredName || "Not recorded"}</div>
            <div>Date of Birth</div>
            <div>{formatDisplayDate(formData.dateOfBirth)}</div>
            <div>Gender</div>
            <div>{formData.gender || "Not recorded"}</div>
            <div>Ethnicity</div>
            <div>{formData.ethnicity || "Not recorded"}</div>
            <div>NHI Number</div>
            <div>{formData.nhiNumber || "Not yet assigned"}</div>
            <div>Date of Injury</div>
            <div>{formatDisplayDate(formData.dateOfInjury)}</div>
            <div>Next Review Date</div>
            <div>{formatDisplayDate(formData.reviewDate)}</div>
            <div>Injury Cause</div>
            <div>{formData.injuryCause || "Not recorded"}</div>
            <div>Admitting Clinician</div>
            <div>{loggedInGpName}</div>
            <div>Date of Admission</div>
            <div>{admissionDate}</div>
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
          <label style={{ display: "flex", alignItems: "flex-start", gap: 10, cursor: "pointer" }}>
            <input
              type="checkbox"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
            />
            <span style={{ fontSize: 14, color: "#15284C" }}>
              I confirm that this patient has consented to their clinical data being
              stored in the ISNCSCI assessment system.
            </span>
          </label>
        </div>

        {saveError ? (
          <div
            style={{
              marginBottom: 16,
              padding: "12px 14px",
              backgroundColor: "#FEF3F2",
              border: "1px solid #FECDCA",
              color: "#B42318",
              fontSize: 14,
            }}
          >
            {saveError}
          </div>
        ) : null}

        <div style={{ display: "flex", justifyContent: "space-between", gap: 16 }}>
          <button
            type="button"
            disabled={saving}
            onClick={() => {
              writeNewPatientFormData(formData);
              router.push("/patients/new");
            }}
            style={{
              minWidth: 160,
              height: 48,
              border: "1px solid #5F6F8C",
              backgroundColor: "#FFFFFF",
              cursor: saving ? "not-allowed" : "pointer",
            }}
          >
            ← Edit
          </button>
          <div style={{ display: "flex", gap: 16 }}>
            <button
              type="button"
              disabled={!consent || saving}
              onClick={() => void handleRegisterPatient()}
              style={{
                minWidth: 170,
                height: 48,
                border: "1px solid #5F6F8C",
                backgroundColor: "#FFFFFF",
                cursor: !consent || saving ? "not-allowed" : "pointer",
              }}
            >
              {saving ? "Registering…" : "Register Patient"}
            </button>
            <button
              type="button"
              disabled={!consent || saving}
              onClick={() => void handleRegisterAndStartAssessment()}
              style={{
                minWidth: 260,
                height: 48,
                border: "none",
                backgroundColor: "#2D3E5E",
                color: "#FFFFFF",
                fontWeight: 600,
                cursor: !consent || saving ? "not-allowed" : "pointer",
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
