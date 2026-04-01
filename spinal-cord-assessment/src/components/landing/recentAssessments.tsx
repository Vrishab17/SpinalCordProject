"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";

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
  dateRaw: string;
  versionNumber: string;
  status: string;
};

type SortKey = "nhiNumber" | "patientName" | "date" | "status";
type SortDir = "asc" | "desc";

function formatDate(dateString: string) {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return dateString;
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

function StatusIndicator({ status }: { status: string }) {
  const upper = status.toUpperCase();

  if (upper === "FINALISED") {
    return (
      <span className="status-indicator status-indicator-finalised">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
          <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
        Finalised
      </span>
    );
  }

  if (upper === "DRAFT") {
    return (
      <span className="status-indicator status-indicator-draft">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
        Draft
      </span>
    );
  }

  if (upper === "IN PROGRESS") {
    return (
      <span className="status-indicator status-indicator-in-progress">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="2" x2="12" y2="6" />
          <line x1="12" y1="18" x2="12" y2="22" />
          <line x1="4.93" y1="4.93" x2="7.76" y2="7.76" />
          <line x1="16.24" y1="16.24" x2="19.07" y2="19.07" />
          <line x1="2" y1="12" x2="6" y2="12" />
          <line x1="18" y1="12" x2="22" y2="12" />
        </svg>
        In Progress
      </span>
    );
  }

  return (
    <span className="status-indicator status-indicator-default">
      {status}
    </span>
  );
}

function SkeletonRows({ count, cols }: { count: number; cols: number }) {
  const widths = ["skeleton-bar-medium", "skeleton-bar-full", "skeleton-bar-short", "skeleton-bar-short", "skeleton-bar-short", "skeleton-bar-short"];
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <tr key={i} className="skeleton-row">
          {Array.from({ length: cols }).map((_, j) => (
            <td key={j}>
              <div className={`skeleton-bar ${widths[j] ?? "skeleton-bar-medium"}`} />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

export default function RecentAssessments() {
  const router = useRouter();

  const [rows, setRows] = useState<RecentAssessmentDisplay[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("date");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  useEffect(() => {
    async function fetchRecentAssessments() {
      const supabase = getSupabaseBrowserClient();
      if (!supabase) {
        setError("Supabase is not configured.");
        setLoading(false);
        return;
      }

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
          dateRaw: a.assessment_date,
          versionNumber: `v${a.current_version}`,
          status: a.status,
        };
      });

      setRows(mappedRows);
      setLoading(false);
    }

    fetchRecentAssessments();
  }, []);

  const filteredAndSorted = useMemo(() => {
    let result = rows;

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (r) =>
          r.nhiNumber.toLowerCase().includes(term) ||
          r.patientName.toLowerCase().includes(term)
      );
    }

    result = [...result].sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case "nhiNumber":
          cmp = a.nhiNumber.localeCompare(b.nhiNumber);
          break;
        case "patientName":
          cmp = a.patientName.localeCompare(b.patientName);
          break;
        case "date":
          cmp = a.dateRaw.localeCompare(b.dateRaw);
          break;
        case "status":
          cmp = a.status.localeCompare(b.status);
          break;
      }
      return sortDir === "asc" ? cmp : -cmp;
    });

    return result;
  }, [rows, searchTerm, sortKey, sortDir]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  function sortIndicator(key: SortKey) {
    if (sortKey !== key) return <span className="sort-arrow">&darr;</span>;
    return (
      <span className="sort-arrow sort-arrow-active">
        {sortDir === "asc" ? "\u2191" : "\u2193"}
      </span>
    );
  }

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
          display: "flex",
          alignItems: "center",
          gap: "8px",
        }}
      >
        Recent Assessments
        {!loading && rows.length > 0 && (
          <span style={{
            fontSize: "12px",
            fontWeight: 600,
            color: "#6B7280",
            backgroundColor: "#F3F4F6",
            borderRadius: "10px",
            padding: "1px 8px",
          }}>
            {rows.length}
          </span>
        )}
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
              <th scope="col" style={headerCellStyle} className="sortable-header" onClick={() => toggleSort("nhiNumber")}>
                NHI Number {sortIndicator("nhiNumber")}
              </th>
              <th scope="col" style={headerCellStyle} className="sortable-header" onClick={() => toggleSort("patientName")}>
                Patient Name {sortIndicator("patientName")}
              </th>
              <th scope="col" style={headerCellStyle} className="sortable-header" onClick={() => toggleSort("date")}>
                Date {sortIndicator("date")}
              </th>
              <th scope="col" style={headerCellStyle}>Version</th>
              <th scope="col" style={headerCellStyle} className="sortable-header" onClick={() => toggleSort("status")}>
                Status {sortIndicator("status")}
              </th>
              <th scope="col" style={{ ...headerCellStyle, textAlign: "right" }}>Action</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <SkeletonRows count={6} cols={colSpan} />
            ) : error ? (
              <tr>
                <td colSpan={colSpan} style={{ padding: "24px", textAlign: "center", color: "red" }}>
                  {error}
                </td>
              </tr>
            ) : filteredAndSorted.length === 0 ? (
              <tr>
                <td colSpan={colSpan}>
                  <div className="empty-state">
                    <svg className="empty-state-icon" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                      <line x1="16" y1="13" x2="8" y2="13" />
                      <line x1="16" y1="17" x2="8" y2="17" />
                    </svg>
                    <div className="empty-state-text">
                      {searchTerm
                        ? `No patients match "${searchTerm}"`
                        : "No assessments yet"}
                    </div>
                    {!searchTerm && (
                      <button className="empty-state-cta">
                        + New Patient
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              filteredAndSorted.map((row) => {
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
                    <td className="nhi-cell" style={{ ...bodyCellStyle, borderBottom: "1px solid #E5E7EB" }}>{row.nhiNumber}</td>
                    <td
                      style={{ ...bodyCellStyle, borderBottom: "1px solid #E5E7EB", maxWidth: "180px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
                      title={row.patientName}
                    >
                      {row.patientName}
                    </td>
                    <td style={{ ...bodyCellStyle, borderBottom: "1px solid #E5E7EB" }}>{row.date}</td>
                    <td style={{ ...bodyCellStyle, borderBottom: "1px solid #E5E7EB" }}>{row.versionNumber}</td>
                    <td style={{ ...bodyCellStyle, borderBottom: "1px solid #E5E7EB" }}>
                      <StatusIndicator status={row.status} />
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
