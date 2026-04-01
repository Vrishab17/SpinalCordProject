"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

type AssessmentRow = {
  assessment_id: number;
  assessment_date: string;
  status: string;
  current_version: number;
  PATIENTpatient_id: number;
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

type RecentAssessmentDisplay = {
  id: number;
  patientId: number;
  nhiNumber: string;
  patientName: string;
  date: string;
  versionNumber: string;
  status: string;
};

function formatDate(dateString: string) {
  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return dateString;
  }

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
}

function getStatusColor(status: string) {
  switch (status.toUpperCase()) {
    case "DRAFT":
      return "#C96A2B";
    case "FINALISED":
      return "#3E8E41";
    case "IN PROGRESS":
      return "#2F66C8";
    default:
      return "#15284C";
  }
}

export default function RecentAssessments() {
  const router = useRouter();

  const [rows, setRows] = useState<RecentAssessmentDisplay[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    async function fetchRecentAssessments() {
      setLoading(true);
      setError(null);

      const { data: assessmentData, error: assessmentError } = await supabase
        .from("Assessment")
        .select(
          "assessment_id, assessment_date, status, current_version, PATIENTpatient_id"
        )
        .order("assessment_date", { ascending: false })
        .limit(50);

      if (assessmentError) {
        setError(`Assessment query failed: ${assessmentError.message}`);
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

      const mappedRows: RecentAssessmentDisplay[] = assessments.map((a) => {
        const patient = patientMap.get(a.PATIENTpatient_id);
        const name = nameMap.get(a.PATIENTpatient_id);

        return {
          id: a.assessment_id,
          patientId: a.PATIENTpatient_id,
          nhiNumber: patient?.nhi_number ?? "N/A",
          patientName: name
            ? `${name.given_name} ${name.family_name}`
            : `Patient #${a.PATIENTpatient_id}`,
          date: formatDate(a.assessment_date),
          versionNumber: `v${a.current_version}`,
          status: a.status,
        };
      });

      setRows(mappedRows);
      setLoading(false);
    }

    fetchRecentAssessments();
  }, []);

  const filteredRows = useMemo(() => {
    if (!searchTerm.trim()) return rows;
    const term = searchTerm.toLowerCase();
    return rows.filter(
      (r) =>
        r.nhiNumber.toLowerCase().includes(term) ||
        r.patientName.toLowerCase().includes(term)
    );
  }, [rows, searchTerm]);

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
  };

  const colSpan = 6;

  function handleRowKeyDown(e: React.KeyboardEvent, patientId: number) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      router.push(`/history/${patientId}`);
    }
  }

  function handleActionClick(e: React.MouseEvent, row: RecentAssessmentDisplay) {
    e.stopPropagation();
    if (row.status.toUpperCase() === "DRAFT") {
      router.push(`/assessment?assessmentId=${row.id}`);
    } else {
      router.push(`/history/${row.patientId}`);
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
          margin: "0 0 14px 0",
          flexShrink: 0,
        }}
      >
        Recent Assessments
      </h2>

      <div style={{ position: "relative", marginBottom: "14px", flexShrink: 0 }}>
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#9CA3AF"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          type="text"
          className="search-input"
          placeholder="Search by NHI or name..."
          aria-label="Search patients"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm("")}
            aria-label="Clear search"
            className="btn"
            style={{
              position: "absolute",
              right: "8px",
              top: "50%",
              transform: "translateY(-50%)",
              background: "none",
              border: "none",
              padding: "4px",
              fontSize: "18px",
              lineHeight: 1,
              color: "#6B7280",
            }}
          >
            &times;
          </button>
        )}
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
            color: "#15284C",
          }}
        >
          <thead>
            <tr>
              <th scope="col" style={headerCellStyle}>NHI Number</th>
              <th scope="col" style={headerCellStyle}>Patient Name</th>
              <th scope="col" style={headerCellStyle}>Date</th>
              <th scope="col" style={headerCellStyle}>Version</th>
              <th scope="col" style={headerCellStyle}>Status</th>
              <th scope="col" style={{ ...headerCellStyle, textAlign: "right" }}>Action</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={colSpan} style={{ padding: "24px", textAlign: "center", color: "#6B7280" }}>
                  Loading...
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={colSpan} style={{ padding: "24px", textAlign: "center", color: "red" }}>
                  {error}
                </td>
              </tr>
            ) : filteredRows.length === 0 ? (
              <tr>
                <td colSpan={colSpan} style={{ padding: "24px", textAlign: "center", color: "#6B7280" }}>
                  {searchTerm ? "No patients match your search." : "No recent assessments to display."}
                </td>
              </tr>
            ) : (
              filteredRows.map((row) => {
                const isDraft = row.status.toUpperCase() === "DRAFT";
                return (
                  <tr
                    key={row.id}
                    className="clickable-row"
                    role="link"
                    tabIndex={0}
                    aria-label={`View patient ${row.patientName}`}
                    onClick={() => router.push(`/history/${row.patientId}`)}
                    onKeyDown={(e) => handleRowKeyDown(e, row.patientId)}
                  >
                    <td style={{ ...bodyCellStyle, borderBottom: "1px solid #E5E7EB" }}>{row.nhiNumber}</td>
                    <td style={{ ...bodyCellStyle, borderBottom: "1px solid #E5E7EB" }}>{row.patientName}</td>
                    <td style={{ ...bodyCellStyle, borderBottom: "1px solid #E5E7EB" }}>{row.date}</td>
                    <td style={{ ...bodyCellStyle, borderBottom: "1px solid #E5E7EB" }}>{row.versionNumber}</td>
                    <td
                      style={{
                        ...bodyCellStyle,
                        borderBottom: "1px solid #E5E7EB",
                        color: getStatusColor(row.status),
                      }}
                    >
                      {row.status}
                    </td>
                    <td style={{ ...bodyCellStyle, borderBottom: "1px solid #E5E7EB", textAlign: "right" }}>
                      <button
                        className="row-action-btn"
                        onClick={(e) => handleActionClick(e, row)}
                        aria-label={isDraft ? `Continue draft for ${row.patientName}` : `View ${row.patientName}`}
                      >
                        {isDraft ? "Continue Draft" : "View"}
                      </button>
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
