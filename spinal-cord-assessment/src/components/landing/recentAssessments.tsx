"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties } from "react";
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
  assessmentDateMs: number;
  versionNum: number;
  versionNumber: string;
  status: string;
};

type DateSortChoice = "date_latest_first" | "date_earliest_first";
type VersionSortChoice = "version_newest" | "version_oldest";
type StatusFilterChoice = "status_draft" | "status_finalised";

type DashboardFilterSelections = {
  date: DateSortChoice | null;
  version: VersionSortChoice | null;
  status: StatusFilterChoice | null;
};

function matchesFinalisedStatus(status: string): boolean {
  const u = status.toUpperCase();
  return u === "FINALISED" || u === "FINALIZED";
}

function compareByDateThenVersion(
  a: RecentAssessmentDisplay,
  b: RecentAssessmentDisplay,
  dateDir: number
): number {
  const d = a.assessmentDateMs - b.assessmentDateMs;
  if (d !== 0) return dateDir * d;
  return b.versionNum - a.versionNum;
}

function filterByStatus(
  rows: RecentAssessmentDisplay[],
  status: StatusFilterChoice | null
): RecentAssessmentDisplay[] {
  if (status === "status_draft") {
    return rows.filter((r) => r.status.toUpperCase() === "DRAFT");
  }
  if (status === "status_finalised") {
    return rows.filter((r) => matchesFinalisedStatus(r.status));
  }
  return rows;
}

function sortRows(
  rows: RecentAssessmentDisplay[],
  selections: DashboardFilterSelections
): RecentAssessmentDisplay[] {
  const copy = [...rows];
  const { date, version } = selections;

  const dateDir = date === "date_earliest_first" ? 1 : date === "date_latest_first" ? -1 : null;
  const versionCmp = (a: RecentAssessmentDisplay, b: RecentAssessmentDisplay): number => {
    if (version === "version_newest") {
      const v = b.versionNum - a.versionNum;
      if (v !== 0) return v;
    } else if (version === "version_oldest") {
      const v = a.versionNum - b.versionNum;
      if (v !== 0) return v;
    }
    return 0;
  };

  copy.sort((a, b) => {
    if (dateDir !== null) {
      const d = dateDir * (a.assessmentDateMs - b.assessmentDateMs);
      if (d !== 0) return d;
      const v = versionCmp(a, b);
      if (v !== 0) return v;
      return b.versionNum - a.versionNum;
    }
    if (version === "version_newest" || version === "version_oldest") {
      const v = versionCmp(a, b);
      if (v !== 0) return v;
      return b.assessmentDateMs - a.assessmentDateMs;
    }
    return compareByDateThenVersion(a, b, -1);
  });

  return copy;
}

function filterAndSortRows(
  rows: RecentAssessmentDisplay[],
  selections: DashboardFilterSelections
): RecentAssessmentDisplay[] {
  const filtered = filterByStatus(rows, selections.status);
  return sortRows(filtered, selections);
}

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
  const [filterSelections, setFilterSelections] = useState<DashboardFilterSelections>({
    date: "date_latest_first",
    version: null,
    status: null,
  });
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const displayedRows = useMemo(
    () => filterAndSortRows(rows, filterSelections),
    [rows, filterSelections]
  );

  const filterSections: {
    heading: string;
    sectionKey: keyof DashboardFilterSelections;
    options: {
      value: NonNullable<DashboardFilterSelections[keyof DashboardFilterSelections]>;
      label: string;
    }[];
  }[] = [
    {
      heading: "Date",
      sectionKey: "date",
      options: [
        { value: "date_earliest_first", label: "Earliest" },
        { value: "date_latest_first", label: "Latest" },
      ],
    },
    {
      heading: "Version",
      sectionKey: "version",
      options: [
        { value: "version_oldest", label: "Oldest" },
        { value: "version_newest", label: "Newest" },
      ],
    },
    {
      heading: "Status",
      sectionKey: "status",
      options: [
        { value: "status_draft", label: "Draft" },
        { value: "status_finalised", label: "Finalised" },
      ],
    },
  ];

  useEffect(() => {
    if (!dropdownOpen) return;
    function handleOutsideClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [dropdownOpen]);

  function toggleFilterOption(
    sectionKey: keyof DashboardFilterSelections,
    value: DateSortChoice | VersionSortChoice | StatusFilterChoice
  ) {
    setFilterSelections((prev) => {
      if (sectionKey === "date") {
        const v = value as DateSortChoice;
        return { ...prev, date: prev.date === v ? null : v };
      }
      if (sectionKey === "version") {
        const v = value as VersionSortChoice;
        return { ...prev, version: prev.version === v ? null : v };
      }
      const v = value as StatusFilterChoice;
      return { ...prev, status: prev.status === v ? null : v };
    });
  }

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
        const parsed = new Date(a.assessment_date).getTime();

        return {
          id: a.assessment_id,
          patientId: a.PATIENTpatient_id,
          nhiNumber: patient?.nhi_number ?? "N/A",
          patientName: name
            ? `${name.given_name} ${name.family_name}`
            : `Patient #${a.PATIENTpatient_id}`,
          date: formatDate(a.assessment_date),
          assessmentDateMs: Number.isNaN(parsed) ? 0 : parsed,
          versionNum: a.current_version,
          versionNumber: `v${a.current_version}`,
          status: a.status,
        };
      });

      setRows(mappedRows);
      setLoading(false);
    }

    fetchRecentAssessments();
  }, []);

  const headerCellStyle: CSSProperties = {
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

  const bodyCellStyle: CSSProperties = {
    padding: "14px 12px",
    minHeight: "48px",
    verticalAlign: "middle",
  };

  return (
    <div
      style={{
        backgroundColor: "#FFFFFF",
        border: "1px solid #D6D6D6",
        padding: "18px",
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
          gap: "12px",
          margin: "0 0 14px 0",
          flexShrink: 0,
          flexWrap: "wrap",
        }}
      >
        <h2
          style={{
            fontSize: "20px",
            fontWeight: 600,
            margin: 0,
          }}
        >
          Recent Assessments
        </h2>
        <div ref={dropdownRef} style={{ position: "relative" }}>
          <button
            type="button"
            aria-haspopup="menu"
            aria-expanded={dropdownOpen}
            onClick={() => setDropdownOpen((o) => !o)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              border: "1px solid #D6D6D6",
              borderRadius: "6px",
              padding: "8px 12px",
              fontSize: "14px",
              fontWeight: 500,
              color: "#15284C",
              backgroundColor: "#FFFFFF",
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            Filter
            <svg
              width="12"
              height="12"
              viewBox="0 0 12 12"
              fill="none"
              aria-hidden="true"
              style={{
                transform: dropdownOpen ? "rotate(180deg)" : "rotate(0deg)",
                transition: "transform 0.15s ease",
              }}
            >
              <path d="M2 4L6 8L10 4" stroke="#15284C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          {dropdownOpen && (
            <div
              role="menu"
              aria-label="Filter and sort recent assessments"
              style={{
                position: "absolute",
                top: "calc(100% + 4px)",
                right: 0,
                backgroundColor: "#FFFFFF",
                border: "1px solid #D6D6D6",
                borderRadius: "6px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.10)",
                zIndex: 10,
                minWidth: "200px",
                overflow: "hidden",
                padding: "6px 0",
              }}
            >
              {filterSections.map((section, i) => (
                <div key={section.heading} role="group" aria-label={section.heading}>
                  {i > 0 && (
                    <div style={{ height: "1px", backgroundColor: "#E5E7EB", margin: "6px 0" }} />
                  )}
                  <div
                    style={{
                      padding: "6px 14px 4px",
                      fontSize: "12px",
                      fontWeight: 700,
                      color: "#15284C",
                      letterSpacing: "0.04em",
                      textTransform: "uppercase",
                    }}
                  >
                    {section.heading}
                  </div>
                  {section.options.map((opt) => {
                    const selected = filterSelections[section.sectionKey] === opt.value;
                    return (
                      <button
                        key={String(opt.value)}
                        type="button"
                        role="menuitemcheckbox"
                        aria-checked={selected}
                        onClick={() => toggleFilterOption(section.sectionKey, opt.value)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                          width: "100%",
                          textAlign: "left",
                          padding: "8px 14px 8px 14px",
                          fontSize: "14px",
                          fontWeight: 400,
                          fontFamily: "inherit",
                          color: "#15284C",
                          backgroundColor: "transparent",
                          border: "none",
                          cursor: "pointer",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = "#F3F4F6";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = "transparent";
                        }}
                      >
                        <span
                          aria-hidden
                          style={{
                            width: "18px",
                            height: "18px",
                            borderRadius: "4px",
                            border: `2px solid ${selected ? "#15284C" : "#D1D5DB"}`,
                            backgroundColor: selected ? "#15284C" : "transparent",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                            boxSizing: "border-box",
                          }}
                        >
                          {selected ? (
                            <svg width="10" height="10" viewBox="0 0 12 12" fill="none" aria-hidden>
                              <path
                                d="M2 6L5 9L10 3"
                                stroke="#FFFFFF"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          ) : null}
                        </span>
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          )}
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
            color: "#15284C",
          }}
        >
          <thead>
            <tr>
              <th style={headerCellStyle}>NHI Number</th>
              <th style={headerCellStyle}>Patient Name</th>
              <th style={headerCellStyle}>Date</th>
              <th style={headerCellStyle}>Version Number</th>
              <th style={headerCellStyle}>Status</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} style={{ padding: "24px", textAlign: "center", color: "#6B7280" }}>
                  Loading...
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={5} style={{ padding: "24px", textAlign: "center", color: "red" }}>
                  {error}
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ padding: "24px", textAlign: "center", color: "#6B7280" }}>
                  No recent assessments to display.
                </td>
              </tr>
            ) : displayedRows.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ padding: "24px", textAlign: "center", color: "#6B7280" }}>
                  No assessments match this filter.
                </td>
              </tr>
            ) : (
              displayedRows.map((row) => (
                <tr
                  key={row.id}
                  onClick={() => router.push(`/history/${row.patientId}`)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#F8FAFC";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "transparent";
                  }}
                  style={{
                    cursor: "pointer",
                  }}
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
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}