"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Header from "@/components/layout/Header";
import AssessmentHistoryPanel from "./AssessmentHistoryPanel";
import type { AssessmentDisplay } from "./AssessmentHistoryPanel";

type PatientRow = {
  patient_id: number;
  nhi_number: string | null;
  date_of_birth: string | null;
  gender: string | null;
  nz_citizenship_status: string | null;
  ethnicity: string | null;
  place_of_birth: string | null;
};

const NAVY = "#15284C";
const BORDER = "#D6D6D6";
const BG = "#F6F4EC";
const LABEL_COL = "#6B7A96";

function formatDate(ds: string | null | undefined): string {
  if (!ds) return "N/A";
  const d = new Date(ds);
  if (Number.isNaN(d.getTime())) return ds;
  return d.toLocaleDateString("en-NZ", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function calculateAge(dob: string | null | undefined): string {
  if (!dob) return "N/A";
  const birth = new Date(dob);
  if (Number.isNaN(birth.getTime())) return "N/A";
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return `${age} Years`;
}

export default function HistoryPageClient() {
  const params = useParams();
  const patientIdParam = String(params.patientId ?? "");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [patient, setPatient] = useState<PatientRow | null>(null);
  const [fullName, setFullName] = useState("Unknown");
  const [addressLines, setAddressLines] = useState<string[]>([]);
  const [assessments, setAssessments] = useState<AssessmentDisplay[]>([]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      const numericId = Number(patientIdParam);
      if (!Number.isInteger(numericId) || Number.isNaN(numericId)) {
        setError("History route expects numeric patient_id.");
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`/api/history/${numericId}`, {
          credentials: "include",
        });
        const body = (await res.json()) as {
          patient?: PatientRow;
          fullName?: string;
          addressLines?: string[];
          assessments?: AssessmentDisplay[];
          error?: string;
        };
        if (!res.ok || !body.patient) {
          throw new Error(body.error ?? "Failed to load patient history");
        }

        if (!cancelled) {
          setPatient(body.patient);
          setFullName(body.fullName ?? "Unknown");
          setAddressLines(body.addressLines ?? []);
          setAssessments(body.assessments ?? []);
          setLoading(false);
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Failed to load patient");
          setLoading(false);
        }
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [patientIdParam]);

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", backgroundColor: BG }}>
        <Header />
        <div style={{ padding: 40, color: NAVY }}>Loading patient history…</div>
      </div>
    );
  }

  if (error || !patient) {
    return (
      <div style={{ minHeight: "100vh", backgroundColor: BG }}>
        <Header />
        <div style={{ padding: 40, color: error ? "#DC2626" : NAVY }}>
          {error ?? "Patient not found"}
        </div>
      </div>
    );
  }

  const detailRows = [
    { label: "Date of Birth", value: formatDate(patient.date_of_birth) },
    { label: "Age", value: calculateAge(patient.date_of_birth) },
    { label: "Gender", value: patient.gender ?? "Unknown" },
    { label: "Ethnicity", value: patient.ethnicity ?? "N/A" },
    { label: "Place of Birth", value: patient.place_of_birth ?? "N/A" },
    {
      label: "NZ Citizenship Status",
      value: patient.nz_citizenship_status ?? "N/A",
    },
    {
      label: "Address",
      value:
        addressLines.length > 0 ? (
          <>
            {addressLines.map((l, i) => (
              <span key={i}>
                {l}
                {i < addressLines.length - 1 && <br />}
              </span>
            ))}
          </>
        ) : (
          "N/A"
        ),
    },
  ];

  return (
    <div
      className="history-page"
      style={{
        height: "100vh",
        overflow: "hidden",
        backgroundColor: BG,
        color: NAVY,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Header />
      <div
        className="history-layout"
        style={{
          padding: "24px 40px 40px",
          display: "grid",
          gridTemplateColumns: "minmax(280px, 1fr) minmax(0, 2fr)",
          gap: 40,
          flex: 1,
          maxWidth: 1400,
          margin: "0 auto",
          width: "100%",
          boxSizing: "border-box",
        }}
      >
        <div className="patient-details-card history-card">
          <h2 style={{ fontSize: 22, fontWeight: 700, margin: "0 0 14px" }}>
            Patient Details
          </h2>
          <div
            className="history-card"
            style={{
              border: `1px solid ${BORDER}`,
              backgroundColor: "#FFFFFF",
              padding: "20px 22px 24px",
            }}
          >
            <h1 style={{ fontSize: 28, fontWeight: 600, margin: "0 0 2px" }}>
              {fullName}
            </h1>
            <p style={{ fontSize: 13, margin: "0 0 18px", color: LABEL_COL }}>
              NHI: {patient.nhi_number ?? "N/A"}
            </p>
            <div style={{ display: "grid", rowGap: 8 }}>
              {detailRows.map(({ label, value }) => (
                <div
                  className="history-detail-grid"
                  key={label}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    columnGap: 8,
                  }}
                >
                  <span style={{ fontSize: 13, color: LABEL_COL }}>{label}</span>
                  <span
                    style={{
                      fontSize: 13,
                      textAlign: "right",
                      lineHeight: 1.5,
                    }}
                  >
                    {value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <AssessmentHistoryPanel
          assessments={assessments}
          nhiNumber={patient.nhi_number ?? "N/A"}
        />
      </div>
    </div>
  );
}
