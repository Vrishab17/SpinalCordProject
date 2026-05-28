"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Header from "@/components/layout/Header";
import { supabase } from "@/lib/supabaseClient";
import { normalizeNhi } from "@/lib/nhi";
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

type PatientNameRow = {
  given_name: string | null;
  family_name: string | null;
};

type PatientAddressRow = {
  line1: string | null;
  line2: string | null;
  suburb: string | null;
  city: string | null;
  postal_code: number | null;
  country: string | null;
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
      const isNumeric =
        Number.isInteger(numericId) && !Number.isNaN(numericId);

      try {
        let patientRow: PatientRow | null = null;

        if (isNumeric) {
          const { data, error: pErr } = await supabase
            .from("Patient")
            .select(
              "patient_id,nhi_number,date_of_birth,gender,nz_citizenship_status,place_of_birth,ethnicity"
            )
            .eq("patient_id", numericId)
            .maybeSingle();
          if (pErr) throw new Error(pErr.message);
          patientRow = data as PatientRow | null;
        } else {
          const { data, error: pErr } = await supabase
            .from("Patient")
            .select(
              "patient_id,nhi_number,date_of_birth,gender,nz_citizenship_status,place_of_birth,ethnicity"
            )
            .eq("nhi_number", normalizeNhi(patientIdParam))
            .maybeSingle();
          if (pErr) throw new Error(pErr.message);
          patientRow = data as PatientRow | null;
        }

        if (!patientRow) {
          if (!cancelled) {
            setError(`No patient found for: ${patientIdParam}`);
            setLoading(false);
          }
          return;
        }

        const pid = patientRow.patient_id;

        const [nameRes, addressRes, assessRes] = await Promise.all([
          supabase
            .from("Patient Name")
            .select("given_name,family_name")
            .eq("PATIENTpatient_id", pid)
            .limit(1)
            .maybeSingle(),
          supabase
            .from("Patient Address")
            .select("line1,line2,suburb,city,postal_code,country")
            .eq("PATIENTpatient_id", pid)
            .limit(1)
            .maybeSingle(),
          supabase
            .from("Assessment")
            .select("assessment_id,assessment_date,status,STAFFstaff_id")
            .eq("PATIENTpatient_id", pid)
            .order("assessment_date", { ascending: false }),
        ]);

        if (assessRes.error) throw new Error(assessRes.error.message);

        const name = nameRes.data as PatientNameRow | null;
        const address = addressRes.data as PatientAddressRow | null;
        const assessRows = assessRes.data ?? [];

        const staffIds = [
          ...new Set(
            assessRows
              .map((a) => a.STAFFstaff_id as number | null)
              .filter((id): id is number => id != null)
          ),
        ];

        const staffNameById = new Map<
          number,
          { prefix: string | null; given_name: string | null; family_name: string | null }
        >();

        if (staffIds.length > 0) {
          const { data: staffRows } = await supabase
            .from("Staff Name")
            .select("STAFFstaff_id,prefix,given_name,family_name")
            .in("STAFFstaff_id", staffIds);
          for (const row of staffRows ?? []) {
            const r = row as {
              STAFFstaff_id: number;
              prefix: string | null;
              given_name: string | null;
              family_name: string | null;
            };
            staffNameById.set(r.STAFFstaff_id, r);
          }
        }

        const assessmentIds = assessRows.map(
          (a) => a.assessment_id as string
        );
        const aisByAssessment = new Map<string, string | null>();

        if (assessmentIds.length > 0) {
          const { data: examRows } = await supabase
            .from("Exam")
            .select("exam_id,ASSESSMENTassessment_id")
            .in("ASSESSMENTassessment_id", assessmentIds);

          const bestExam = new Map<string, number>();
          for (const row of examRows ?? []) {
            const e = row as { exam_id: number; ASSESSMENTassessment_id: string };
            const prev = bestExam.get(e.ASSESSMENTassessment_id);
            if (prev === undefined || e.exam_id > prev) {
              bestExam.set(e.ASSESSMENTassessment_id, e.exam_id);
            }
          }

          const examIds = [...bestExam.values()];
          if (examIds.length > 0) {
            const { data: classRows } = await supabase
              .from("Classification Result")
              .select("EXAMexam_id,ais_grade")
              .in("EXAMexam_id", examIds);

            const aisByExam = new Map<number, string | null>();
            for (const row of classRows ?? []) {
              const cr = row as { EXAMexam_id: number; ais_grade: string | null };
              aisByExam.set(cr.EXAMexam_id, cr.ais_grade);
            }
            for (const [aid, eid] of bestExam) {
              aisByAssessment.set(aid, aisByExam.get(eid) ?? null);
            }
          }
        }

        const display: AssessmentDisplay[] = assessRows.map((a) => {
          const sid = a.STAFFstaff_id as number | null;
          const sn = sid != null ? staffNameById.get(sid) : undefined;
          const fam = sn?.family_name?.trim() ?? "";
          const given = sn?.given_name?.trim() ?? "";
          const prefix = (sn?.prefix?.trim() || "Dr").replace(/\.$/, "");
          const initial = given ? `${given[0]}.` : "";
          const clinician =
            fam || given
              ? `${prefix} ${initial} ${fam}`.replace(/\s+/g, " ").trim()
              : "Unassigned";

          return {
            assessment_id: a.assessment_id as string,
            assessment_date: a.assessment_date as string | null,
            status: a.status as string | null,
            clinicianName: clinician,
            alsGrade: aisByAssessment.get(a.assessment_id as string) ?? null,
          };
        });

        const nm =
          name && (name.family_name || name.given_name)
            ? `${name.family_name ?? ""}${
                name.family_name && name.given_name ? ", " : ""
              }${name.given_name ?? ""}`
            : "Unknown";

        const lines: string[] = address
          ? [
              address.line1,
              address.line2,
              address.suburb,
              address.city,
              address.country,
              address.postal_code != null ? String(address.postal_code) : null,
            ].filter((v): v is string => v != null && v.trim() !== "")
          : [];

        if (!cancelled) {
          setPatient(patientRow);
          setFullName(nm);
          setAddressLines(lines);
          setAssessments(display);
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
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 700, margin: "0 0 14px" }}>
            Patient Details
          </h2>
          <div
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
