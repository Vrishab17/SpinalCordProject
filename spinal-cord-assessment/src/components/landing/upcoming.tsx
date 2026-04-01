"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

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

  const isToday = reviewOnly.getTime() === todayOnly.getTime();

  if (isToday) {
    return { formatted: "Today", isToday: true };
  }

  const day = String(reviewDate.getDate()).padStart(2, "0");
  const month = String(reviewDate.getMonth() + 1).padStart(2, "0");
  const year = reviewDate.getFullYear();

  return {
    formatted: `${day}/${month}/${year}`,
    isToday: false,
  };
}

export default function UpcomingReviews() {
  const router = useRouter();

  const [rows, setRows] = useState<UpcomingReviewDisplay[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchUpcomingReviews() {
      setLoading(true);
      setError(null);

      const today = new Date();
      const yyyy = today.getFullYear();
      const mm = String(today.getMonth() + 1).padStart(2, "0");
      const dd = String(today.getDate()).padStart(2, "0");
      const todayString = `${yyyy}-${mm}-${dd}`;

      const { data: assessmentData, error: assessmentError } = await supabase
        .from("Assessment")
        .select("assessment_id, PATIENTpatient_id, review_date")
        .gte("review_date", todayString)
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
        };
      });

      setRows(mappedRows);
      setLoading(false);
    }

    fetchUpcomingReviews();
  }, []);

  const headerCellStyle: React.CSSProperties = {
    padding: "14px 12px",
    minHeight: "48px",
    fontWeight: 600,
    position: "sticky",
    top: 0,
    backgroundColor: "#FFFFFF",
    zIndex: 2,
    textAlign: "left",
    borderBottom: "1px solid #D6D6D6",
  };

  const bodyCellStyle: React.CSSProperties = {
    padding: "14px 12px",
    minHeight: "48px",
    verticalAlign: "middle",
    borderBottom: "1px solid #E5E7EB",
  };

  function handleRowKeyDown(e: React.KeyboardEvent, patientId: number) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      router.push(`/history/${patientId}`);
    }
  }

  return (
    <div
      className="dashboard-card"
      style={{
        backgroundColor: "#FFFFFF",
        border: "1px solid #D6D6D6",
        borderRadius: "8px",
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
      <h2
        style={{
          fontSize: "20px",
          fontWeight: 600,
          marginBottom: "14px",
          flexShrink: 0,
        }}
      >
        Upcoming Reviews
      </h2>

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
              <th scope="col" style={headerCellStyle}>NHI</th>
              <th scope="col" style={headerCellStyle}>Patient Name</th>
              <th scope="col" style={headerCellStyle}>Date</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
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
            ) : rows.length === 0 ? (
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
              rows.map((row) => (
                <tr
                  key={row.id}
                  className="clickable-row"
                  role="link"
                  tabIndex={0}
                  aria-label={`View patient ${row.patientName}`}
                  onClick={() => router.push(`/history/${row.patientId}`)}
                  onKeyDown={(e) => handleRowKeyDown(e, row.patientId)}
                >
                  <td style={bodyCellStyle}>{row.nhi}</td>
                  <td style={bodyCellStyle}>{row.patientName}</td>
                  <td style={bodyCellStyle}>
                    {row.isToday ? (
                      <span
                        style={{
                          display: "inline-block",
                          padding: "2px 10px",
                          borderRadius: "12px",
                          backgroundColor: "#15284C",
                          color: "#FFFFFF",
                          fontWeight: 600,
                          fontSize: "13px",
                        }}
                      >
                        Today
                      </span>
                    ) : (
                      row.date
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
