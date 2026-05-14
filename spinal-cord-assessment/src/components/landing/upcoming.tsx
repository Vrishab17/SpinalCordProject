"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import {
  DEFAULT_CLINICIAN_PATIENT_FILTER,
  type ClinicianPatientFilter,
} from "@/lib/clinicianPatientFilter";

type UpcomingReviewsProps = {
  clinicianPatientFilter?: ClinicianPatientFilter;
};

type AssessmentRow = {
  assessment_id: number;
  PATIENTpatient_id: number;
  review_date: string;
};

type PatientRow = {
  patient_id: number;
  nhi_number: string;
};

type PatientNameRow = {
  PATIENTpatient_id: number;
  given_name: string;
  family_name: string;
};

type UpcomingReviewDisplay = {
  id: number;
  patientId: number;
  nhi: string;
  patientName: string;
  date: string;
  isToday: boolean;
  isOverdue: boolean;
  reviewDateMs: number;
};

function formatReviewDate(dateString: string) {
  const reviewDate = new Date(dateString);
  const today = new Date();

  const reviewOnly = new Date(
    reviewDate.getFullYear(),
    reviewDate.getMonth(),
    reviewDate.getDate()
  );

  const todayOnly = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );

  const reviewDateMs = reviewOnly.getTime();
  const isToday = reviewDateMs === todayOnly.getTime();
  const isOverdue = reviewDateMs < todayOnly.getTime();

  if (isToday) {
    return { formatted: "Today", isToday: true, isOverdue: false, reviewDateMs };
  }

  const day = String(reviewDate.getDate()).padStart(2, "0");
  const month = String(reviewDate.getMonth() + 1).padStart(2, "0");
  const year = reviewDate.getFullYear();

  return {
    formatted: `${day}/${month}/${year}`,
    isToday: false,
    isOverdue,
    reviewDateMs,
  };
}

export default function UpcomingReviews({
  clinicianPatientFilter = DEFAULT_CLINICIAN_PATIENT_FILTER,
}: UpcomingReviewsProps) {
  const router = useRouter();

  const [rows, setRows] = useState<UpcomingReviewDisplay[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bellHover, setBellHover] = useState(false);

  useEffect(() => {
    async function fetchUpcomingReviews() {
      setLoading(true);
      setError(null);

      const { data: assessmentData, error: assessmentError } = await supabase
        .from("Assessment")
        .select("assessment_id, PATIENTpatient_id, review_date")
        .not("review_date", "is", null)
        .order("review_date", { ascending: true })
        .limit(50);

      if (assessmentError) {
        setError(`Upcoming reviews query failed: ${assessmentError.message}`);
        setLoading(false);
        return;
      }

      const assessments = (assessmentData ?? []) as AssessmentRow[];

      if (assessments.length === 0) {
        setRows([]);
        setLoading(false);
        return;
      }

      const patientIds = [...new Set(assessments.map((a) => a.PATIENTpatient_id))];

      const { data: patientData, error: patientError } = await supabase
        .from("Patient")
        .select("patient_id, nhi_number")
        .in("patient_id", patientIds);

      if (patientError) {
        setError(`Patient query failed: ${patientError.message}`);
        setLoading(false);
        return;
      }

      const { data: patientNameData, error: patientNameError } = await supabase
        .from("Patient Name")
        .select("PATIENTpatient_id, given_name, family_name")
        .in("PATIENTpatient_id", patientIds);

      if (patientNameError) {
        setError(`Patient Name query failed: ${patientNameError.message}`);
        setLoading(false);
        return;
      }

      const patients = (patientData ?? []) as PatientRow[];
      const patientNames = (patientNameData ?? []) as PatientNameRow[];

      const patientMap = new Map<number, PatientRow>();
      patients.forEach((p) => patientMap.set(p.patient_id, p));

      const nameMap = new Map<number, PatientNameRow>();
      patientNames.forEach((n) => nameMap.set(n.PATIENTpatient_id, n));

      const mappedRows: UpcomingReviewDisplay[] = assessments.map((assessment) => {
        const patient = patientMap.get(assessment.PATIENTpatient_id);
        const name = nameMap.get(assessment.PATIENTpatient_id);
        const reviewDate = formatReviewDate(assessment.review_date);

        return {
          id: assessment.assessment_id,
          patientId: assessment.PATIENTpatient_id,
          nhi: patient?.nhi_number ?? "N/A",
          patientName: name
            ? `${name.given_name} ${name.family_name}`
            : `Patient #${assessment.PATIENTpatient_id}`,
          date: reviewDate.formatted,
          isToday: reviewDate.isToday,
          isOverdue: reviewDate.isOverdue,
          reviewDateMs: reviewDate.reviewDateMs,
        };
      });

      setRows(mappedRows);
      setLoading(false);
    }

    fetchUpcomingReviews();
  }, []);

  const filterLoading = clinicianPatientFilter.status === "loading";

  const { sortedRows, overdueCount } = useMemo(() => {
    let list: UpcomingReviewDisplay[];
    if (clinicianPatientFilter.status === "loading") {
      list = [];
    } else if (clinicianPatientFilter.status === "all") {
      list = rows;
    } else {
      list = rows.filter((r) => clinicianPatientFilter.patientIds.has(r.patientId));
    }

    const overdue = list.filter((r) => r.isOverdue).length;
    const sorted = [...list].sort((a, b) => {
      if (a.isOverdue !== b.isOverdue) return a.isOverdue ? -1 : 1;
      return a.reviewDateMs - b.reviewDateMs;
    });
    return { sortedRows: sorted, overdueCount: overdue };
  }, [rows, clinicianPatientFilter]);

  const headerCellStyle: React.CSSProperties = {
    padding: "14px 12px",
    minHeight: "48px",
    fontWeight: 600,
    position: "sticky",
    top: 0,
    backgroundColor: "#FFFFFF",
    zIndex: 2,
    textAlign: "center",
    borderBottom: "1px solid #D6D6D6",
  };

  const bodyCellStyle: React.CSSProperties = {
    padding: "14px 12px",
    minHeight: "48px",
    verticalAlign: "middle",
    borderBottom: "1px solid #E5E7EB",
    textAlign: "center",
  };

  return (
    <div
      style={{
        backgroundColor: "#FFFFFF",
        border: "1px solid #D6D6D6",
        padding: "18px",
        width: "100%",
        color: "#15284C",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        minHeight: 0,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "10px",
          marginBottom: "14px",
          flexShrink: 0,
        }}
      >
        <h2
          style={{
            fontSize: "22px",
            fontWeight: 700,
            margin: 0,
          }}
        >
          Upcoming Reviews
        </h2>
        <div
          style={{ position: "relative", flexShrink: 0 }}
          onMouseEnter={() => setBellHover(true)}
          onMouseLeave={() => setBellHover(false)}
        >
          <button
            type="button"
            aria-label={
              overdueCount > 0
                ? `${overdueCount} assessment${overdueCount === 1 ? "" : "s"} overdue`
                : "No overdue assessments"
            }
            title={
              overdueCount > 0
                ? `${overdueCount} assessment${overdueCount === 1 ? "" : "s"} overdue`
                : "No overdue assessments"
            }
            style={{
              position: "relative",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "6px",
              margin: 0,
              border: "none",
              background: "transparent",
              cursor: "default",
              borderRadius: "8px",
              color: "inherit",
            }}
          >
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
              style={{ display: "block", color: overdueCount > 0 ? "#DC2626" : "#15284C" }}
            >
              <path
                d="M18 8a6 6 0 10-12 0c0 7-3 7-3 7h18s-3 0-3-7zM13.73 21a2 2 0 01-3.46 0"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            {overdueCount > 0 ? (
              <span
                style={{
                  position: "absolute",
                  top: "2px",
                  right: "2px",
                  minWidth: "20px",
                  height: "20px",
                  padding: "0 5px",
                  borderRadius: "999px",
                  backgroundColor: "#DC2626",
                  color: "#FFFFFF",
                  fontSize: "11px",
                  fontWeight: 700,
                  lineHeight: "20px",
                  textAlign: "center",
                  boxSizing: "border-box",
                }}
              >
                {overdueCount > 99 ? "99+" : overdueCount}
              </span>
            ) : null}
          </button>
          {bellHover ? (
            <div
              role="tooltip"
              style={{
                position: "absolute",
                top: "calc(100% + 8px)",
                right: 0,
                padding: "10px 14px",
                backgroundColor: "#15284C",
                color: "#FFFFFF",
                fontSize: "13px",
                fontWeight: 500,
                borderRadius: "8px",
                whiteSpace: "nowrap",
                zIndex: 30,
                boxShadow: "0 6px 16px rgba(0,0,0,0.18)",
                pointerEvents: "none",
              }}
            >
              {overdueCount === 0
                ? "No assessments overdue"
                : `${overdueCount} assessment${overdueCount === 1 ? "" : "s"} overdue`}
            </div>
          ) : null}
        </div>
      </div>

      <div
        style={{
          flex: 1,
          minHeight: 0,
          overflowY: "auto",
          overflowX: "auto",
        }}
      >
        <table
          style={{
            width: "100%",
            borderCollapse: "separate",
            borderSpacing: 0,
            fontSize: "14px",
          }}
        >
          <thead>
            <tr>
              <th style={headerCellStyle}>NHI</th>
              <th style={headerCellStyle}>Patient Name</th>
              <th style={headerCellStyle}>Date</th>
            </tr>
          </thead>

          <tbody>
            {loading || filterLoading ? (
              <tr>
                <td
                  colSpan={3}
                  style={{
                    padding: "24px",
                    textAlign: "center",
                    color: "#6B7280",
                  }}
                >
                  Loading...
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td
                  colSpan={3}
                  style={{
                    padding: "24px",
                    textAlign: "center",
                    color: "red",
                  }}
                >
                  {error}
                </td>
              </tr>
            ) : sortedRows.length === 0 ? (
              <tr>
                <td
                  colSpan={3}
                  style={{
                    padding: "24px",
                    textAlign: "center",
                    color: "#6B7280",
                  }}
                >
                  No upcoming reviews
                </td>
              </tr>
            ) : (
              sortedRows.map((row) => {
                const dateColor = row.isOverdue ? "#DC2626" : row.isToday ? "#C0392B" : "#15284C";
                const defaultBg = row.isOverdue ? "#FEF2F2" : "transparent";
                return (
                  <tr
                    key={row.id}
                    onClick={() => router.push(`/history/${row.patientId}`)}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = row.isOverdue ? "#FEE2E2" : "#F8FAFC";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = defaultBg;
                    }}
                    style={{
                      cursor: "pointer",
                      backgroundColor: defaultBg,
                    }}
                  >
                    <td style={{ ...bodyCellStyle, color: row.isOverdue ? "#DC2626" : "#15284C" }}>
                      {row.nhi}
                    </td>
                    <td style={{ ...bodyCellStyle, color: row.isOverdue ? "#DC2626" : "#15284C" }}>
                      {row.patientName}
                    </td>
                    <td
                      style={{
                        ...bodyCellStyle,
                        color: dateColor,
                        fontWeight: row.isOverdue || row.isToday ? 600 : 400,
                      }}
                    >
                      {row.date}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}