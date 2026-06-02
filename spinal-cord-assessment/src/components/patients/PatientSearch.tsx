"use client";

import type { CSSProperties } from "react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

const NAVY = "#15284C";
const BORDER = "#D6D6D6";
const LABEL_GREY = "#6B7280";
const INPUT_BG = "#EFF1F4";
const GREEN = "#15803D";
const GREEN_SOFT = "#DCFCE7";

/** Centered column width: wider form, no full-bleed white slab */
const CENTER_CARD_MAX = "min(760px, 100%)";

type Patient = {
  id: number;
  name: string;
  nhi: string;
  dob: string;
  gender: string;
  gp: string;
};

function formatDate(dateString: string) {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return dateString;

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
}

function normalizeNhi(raw: string): string {
  return raw.trim().replace(/\s+/g, "").toUpperCase();
}

function isValidNhiFormat(normalized: string): boolean {
  return /^[A-Z]{3}[0-9A-Z]{4}$/.test(normalized);
}

function DetailRow({
  label,
  value,
  last,
}: {
  label: string;
  value: string;
  last?: boolean;
}) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        gap: "24px",
        padding: "14px 0",
        borderBottom: last ? "none" : "1px solid #E5E7EB",
      }}
    >
      <span
        style={{
          fontSize: "14px",
          fontWeight: 600,
          color: LABEL_GREY,
          flexShrink: 0,
          minWidth: "120px",
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontSize: "15px",
          fontWeight: 500,
          color: "#1F2937",
          textAlign: "right",
          wordBreak: "break-word",
        }}
      >
        {value}
      </span>
    </div>
  );
}

function CheckIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      style={{ flexShrink: 0 }}
    >
      <circle cx="12" cy="12" r="11" fill={GREEN} opacity="0.15" />
      <path
        d="M8 12l2.5 2.5L16 9"
        stroke={GREEN}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const panelStyle: CSSProperties = {
  backgroundColor: "#FFFFFF",
  border: `1px solid ${BORDER}`,
  padding: "18px",
  color: NAVY,
  display: "flex",
  flexDirection: "column",
  minHeight: 0,
  boxSizing: "border-box",
};

export default function PatientSearch() {
  const router = useRouter();
  const [nhi, setNhi] = useState("");

  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    setLoading(true);
    setError(null);
    setPatient(null);

    const normalized = normalizeNhi(nhi);

    if (!normalized) {
      setError("Enter an NHI number.");
      setLoading(false);
      return;
    }

    if (!isValidNhiFormat(normalized)) {
      setError(
        "That NHI doesn’t look valid. Use 7 characters: 3 letters followed by 4 letters or digits (e.g. ABC1234)."
      );
      setLoading(false);
      return;
    }

    try {
      const { data, error: supaError } = await supabase
        .from("Patient")
        .select("*")
        .ilike("nhi_number", normalized)
        .limit(1);

      if (supaError) {
        setError(
          supaError.message ||
            "Something went wrong while searching. Try again."
        );
        setLoading(false);
        return;
      }

      if (!data || data.length === 0) {
        setError("No patient found in the database for this NHI number.");
        setLoading(false);
        return;
      }

      const patientRow = data[0];

      const [{ data: nameData }, { data: gpData }] = await Promise.all([
        supabase
          .from("Patient Name")
          .select("given_name, family_name")
          .eq("PATIENTpatient_id", patientRow.patient_id)
          .limit(1),
        supabase
          .from("GP Enrollment")
          .select("hpi_practitioner_id")
          .eq("PATIENTpatient_id", patientRow.patient_id)
          .limit(1),
      ]);

      const fullName = nameData?.[0]
        ? `${nameData[0].given_name} ${nameData[0].family_name}`
        : "Unknown";

      const gp = gpData?.[0]?.hpi_practitioner_id ?? "Not assigned";

      setPatient({
        id: patientRow.patient_id,
        name: fullName,
        nhi: patientRow.nhi_number,
        dob: formatDate(patientRow.date_of_birth),
        gender: patientRow.gender ?? "—",
        gp: String(gp),
      });
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Search failed. Try again.";
      setError(message);
    }

    setLoading(false);
  };

  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        minHeight: 0,
        overflow: "auto",
      }}
    >
      <div
        style={{
          maxWidth: "1300px",
          width: "100%",
          margin: "0 auto",
          padding: "32px 24px",
          display: "flex",
          flexDirection: "column",
          boxSizing: "border-box",
          gap: "20px",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: CENTER_CARD_MAX,
            margin: "0 auto",
            display: "flex",
            flexDirection: "column",
            gap: "20px",
          }}
        >
          <h1
            style={{
              fontSize: "40px",
              fontWeight: 700,
              margin: 0,
              color: NAVY,
              flexShrink: 0,
              textAlign: "center",
            }}
          >
            Patient Search
          </h1>

          <section style={panelStyle}>
            <div
              style={{
                width: "100%",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <h2
                style={{
                  fontSize: "22px",
                  fontWeight: 700,
                  margin: "0 0 8px 0",
                  color: "#374151",
                }}
              >
                Patient Lookup
              </h2>
              <p
                style={{
                  margin: "0 0 24px 0",
                  fontSize: "15px",
                  lineHeight: 1.5,
                  color: LABEL_GREY,
                }}
              >
                Enter an NHI number to look up a patient record.
              </p>

              <div style={{ marginBottom: "20px" }}>
                <label
                  htmlFor="patient-nhi"
                  style={{
                    display: "block",
                    marginBottom: "10px",
                    fontWeight: 700,
                    fontSize: "13px",
                    letterSpacing: "0.06em",
                    color: LABEL_GREY,
                  }}
                >
                  NHI NUMBER
                </label>
                <input
                  id="patient-nhi"
                  value={nhi}
                  onChange={(e) => setNhi(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") void handleSearch();
                  }}
                  placeholder="E.g. WJQ31KO"
                  autoComplete="off"
                  style={{
                    width: "100%",
                    boxSizing: "border-box",
                    padding: "14px 16px",
                    border: "1px solid transparent",
                    borderRadius: "6px",
                    fontSize: "15px",
                    color: NAVY,
                    fontFamily: "inherit",
                    backgroundColor: INPUT_BG,
                  }}
                />
              </div>

              <button
                type="button"
                onClick={() => void handleSearch()}
                disabled={loading}
                style={{
                  width: "100%",
                  backgroundColor: NAVY,
                  color: "#FFFFFF",
                  padding: "14px 20px",
                  border: "none",
                  borderRadius: "6px",
                  cursor: loading ? "wait" : "pointer",
                  fontSize: "15px",
                  fontWeight: 600,
                  fontFamily: "inherit",
                  opacity: loading ? 0.88 : 1,
                }}
              >
                {loading ? "Searching…" : "Search Patient"}
              </button>

              {error ? (
                <p
                  role="alert"
                  style={{
                    color: "#B91C1C",
                    marginTop: "16px",
                    marginBottom: 0,
                    fontSize: "14px",
                    lineHeight: 1.45,
                  }}
                >
                  {error}
                </p>
              ) : null}
            </div>
          </section>

          {patient ? (
            <section style={panelStyle}>
              <div
                style={{
                  width: "100%",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "16px",
                    flexWrap: "wrap",
                    marginBottom: "8px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                    }}
                  >
                    <CheckIcon />
                    <span
                      style={{
                        fontSize: "18px",
                        fontWeight: 700,
                        color: GREEN,
                      }}
                    >
                      Patient Found
                    </span>
                  </div>
                  <span
                    style={{
                      fontSize: "12px",
                      fontWeight: 700,
                      letterSpacing: "0.08em",
                      color: GREEN,
                      backgroundColor: GREEN_SOFT,
                      padding: "8px 14px",
                      borderRadius: "6px",
                    }}
                  >
                    VERIFIED
                  </span>
                </div>

                <div style={{ marginBottom: "8px" }}>
                  <DetailRow label="Full name" value={patient.name} />
                  <DetailRow label="NHI number" value={patient.nhi} />
                  <DetailRow label="DOB" value={patient.dob} />
                  <DetailRow label="Gender" value={patient.gender} />
                  <DetailRow label="GP" value={patient.gp} last />
                </div>

                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    alignItems: "center",
                    gap: "12px",
                    paddingTop: "24px",
                    marginTop: "8px",
                    borderTop: `1px solid ${BORDER}`,
                  }}
                >
                  <button
                    type="button"
                    onClick={() => router.push(`/history/${patient.id}`)}
                    style={{
                      padding: "10px 22px",
                      backgroundColor: "#FFFFFF",
                      color: NAVY,
                      border: `1px solid ${NAVY}`,
                      borderRadius: "6px",
                      fontWeight: 600,
                      fontSize: "14px",
                      fontFamily: "inherit",
                      cursor: "pointer",
                    }}
                  >
                    View History
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      router.push(
                        `/assessment?nhi=${encodeURIComponent(patient.nhi)}`
                      )
                    }
                    style={{
                      padding: "10px 22px",
                      backgroundColor: NAVY,
                      color: "#FFFFFF",
                      border: "none",
                      borderRadius: "6px",
                      fontWeight: 600,
                      fontSize: "14px",
                      fontFamily: "inherit",
                      cursor: "pointer",
                    }}
                  >
                    + New Assessment
                  </button>
                </div>
              </div>
            </section>
          ) : null}
        </div>
      </div>
    </div>
  );
}
