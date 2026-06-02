"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import {
  DEFAULT_CLINICIAN_PATIENT_FILTER,
  type ClinicianPatientFilter,
} from "@/lib/clinicianPatientFilter";
import TablePagination from "@/components/landing/TablePagination";

const PAGE_SIZE = 12;

type RecentAssessmentsProps = {
  clinicianPatientFilter?: ClinicianPatientFilter;
};

type AssessmentRow = {
  assessment_id: string;
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
  id: string;
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

function assessmentTimestamp(row: AssessmentRow): number {
  const parsed = new Date(row.assessment_date).getTime();
  return Number.isNaN(parsed) ? 0 : parsed;
}

function keepLatestPerPatient(assessments: AssessmentRow[]): AssessmentRow[] {
  const byPatient = new Map<number, AssessmentRow>();

  for (const row of assessments) {
    const existing = byPatient.get(row.PATIENTpatient_id);
    if (!existing) {
      byPatient.set(row.PATIENTpatient_id, row);
      continue;
    }

    const existingTs = assessmentTimestamp(existing);
    const rowTs = assessmentTimestamp(row);
    if (
      rowTs > existingTs ||
      (rowTs === existingTs && row.current_version > existing.current_version)
    ) {
      byPatient.set(row.PATIENTpatient_id, row);
    }
  }

  return Array.from(byPatient.values());
}

function sortAssessmentRows(
  assessments: AssessmentRow[],
  filterSelections: DashboardFilterSelections
): AssessmentRow[] {
  const sorted = [...assessments];

  sorted.sort((a, b) => {
    if (filterSelections.date) {
      const dateCmp =
        filterSelections.date === "date_earliest_first"
          ? assessmentTimestamp(a) - assessmentTimestamp(b)
          : assessmentTimestamp(b) - assessmentTimestamp(a);
      if (dateCmp !== 0) return dateCmp;

      if (filterSelections.version) {
        return filterSelections.version === "version_oldest"
          ? a.current_version - b.current_version
          : b.current_version - a.current_version;
      }
      return 0;
    }

    if (filterSelections.version) {
      const versionCmp =
        filterSelections.version === "version_oldest"
          ? a.current_version - b.current_version
          : b.current_version - a.current_version;
      if (versionCmp !== 0) return versionCmp;
      return assessmentTimestamp(b) - assessmentTimestamp(a);
    }

    return assessmentTimestamp(b) - assessmentTimestamp(a);
  });

  return sorted;
}

export default function RecentAssessments({
  clinicianPatientFilter = DEFAULT_CLINICIAN_PATIENT_FILTER,
}: RecentAssessmentsProps) {
  const router = useRouter();

  const [rows, setRows] = useState<RecentAssessmentDisplay[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const requestSeqRef = useRef(0);

  const [filterSelections, setFilterSelections] = useState<DashboardFilterSelections>({
    date: "date_latest_first",
    version: null,
    status: null,
  });
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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

  const clinicianFilterKey = useMemo(() => {
    if (clinicianPatientFilter.status === "all") return "all";
    if (clinicianPatientFilter.status === "loading") return "loading";
    return `mine:${clinicianPatientFilter.staffId}`;
  }, [clinicianPatientFilter]);

  const uiFilterKey = useMemo(
    () => `${filterSelections.date ?? "none"}|${filterSelections.version ?? "none"}|${filterSelections.status ?? "none"}`,
    [filterSelections]
  );

  const prevFilterKeyRef = useRef<string | null>(null);
  useEffect(() => {
    const combinedKey = `${clinicianFilterKey}::${uiFilterKey}`;
    const filterChanged =
      prevFilterKeyRef.current !== null && prevFilterKeyRef.current !== combinedKey;
    prevFilterKeyRef.current = combinedKey;

    if (filterChanged && page !== 1) {
      setPage(1);
      return;
    }

    async function fetchRecentAssessments() {
      const reqId = ++requestSeqRef.current;

      if (clinicianPatientFilter.status === "loading") {
        if (reqId !== requestSeqRef.current) return;
        setLoading(true);
        setRows([]);
        setTotalCount(0);
        setError(null);
        return;
      }

      setLoading(true);
      setError(null);

      let assessmentQuery = supabase
        .from("Assessment")
        .select(
          "assessment_id, assessment_date, status, current_version, PATIENTpatient_id"
        );

      if (filterSelections.status === "status_draft") {
        assessmentQuery = assessmentQuery.eq("status", "DRAFT");
      } else if (filterSelections.status === "status_finalised") {
        assessmentQuery = assessmentQuery.in("status", ["FINALISED", "FINALIZED", "FINAL"]);
      }

      if (clinicianPatientFilter.status === "mine") {
        assessmentQuery = assessmentQuery.eq(
          "STAFFstaff_id",
          clinicianPatientFilter.staffId
        );
      }

      const { data: assessmentData, error: assessmentError } = await assessmentQuery;

      if (reqId !== requestSeqRef.current) return;

      if (assessmentError) {
        setError(`Assessment query failed: ${assessmentError.message}`);
        setLoading(false);
        return;
      }

      const latestPerPatient = keepLatestPerPatient(
        (assessmentData ?? []) as AssessmentRow[]
      );
      const sortedAssessments = sortAssessmentRows(
        latestPerPatient,
        filterSelections
      );
      const totalMatching = sortedAssessments.length;
      setTotalCount(totalMatching);

      if (sortedAssessments.length === 0 && page > 1 && totalMatching > 0) {
        setPage(1);
        setLoading(false);
        return;
      }

      if (sortedAssessments.length === 0) {
        setRows([]);
        setLoading(false);
        return;
      }

      const from = (page - 1) * PAGE_SIZE;
      const assessments = sortedAssessments.slice(from, from + PAGE_SIZE);
      const patientIds = [...new Set(assessments.map((a) => a.PATIENTpatient_id))];

      const { data: patientData, error: patientError } = await supabase
        .from("Patient")
        .select("patient_id, nhi_number")
        .in("patient_id", patientIds);

      if (reqId !== requestSeqRef.current) return;

      if (patientError) {
        setError(`Patient query failed: ${patientError.message}`);
        setLoading(false);
        return;
      }

      const { data: patientNameData, error: patientNameError } = await supabase
        .from("Patient Name")
        .select("PATIENTpatient_id, given_name, family_name")
        .in("PATIENTpatient_id", patientIds);

      if (reqId !== requestSeqRef.current) return;

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
  }, [clinicianFilterKey, uiFilterKey, page, clinicianPatientFilter, filterSelections]);

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

  const headerVersionCellStyle: CSSProperties = {
    ...headerCellStyle,
    textAlign: "center",
  };

  const bodyCellStyle: CSSProperties = {
    padding: "14px 12px",
    minHeight: "48px",
    verticalAlign: "middle",
    textAlign: "left",
  };

  const bodyVersionCellStyle: CSSProperties = {
    ...bodyCellStyle,
    textAlign: "center",
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
            fontSize: "22px",
            fontWeight: 700,
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
          overflow: "hidden",
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
              <th style={headerCellStyle}>Assessment ID</th>
              <th style={headerCellStyle}>NHI Number</th>
              <th style={headerCellStyle}>Patient Name</th>
              <th style={headerCellStyle}>Date</th>
              <th style={headerVersionCellStyle}>Version Number</th>
              <th style={headerCellStyle}>Status</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} style={{ padding: "24px", textAlign: "center", color: "#6B7280" }}>
                  Loading...
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={6} style={{ padding: "24px", textAlign: "center", color: "red" }}>
                  {error}
                </td>
              </tr>
            ) : rows.length === 0 && totalCount === 0 ? (
              <tr>
                <td colSpan={6} style={{ padding: "24px", textAlign: "center", color: "#6B7280" }}>
                  No recent assessments to display.
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ padding: "24px", textAlign: "center", color: "#6B7280" }}>
                  No assessments match this filter.
                </td>
              </tr>
            ) : (
              <>
                {rows.map((row) => (
                  <tr
                    key={row.id}
                    onClick={() => router.push(`/history/${row.patientId}`)}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "#F8FAFC";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "transparent";
                    }}
                    style={{ cursor: "pointer" }}
                  >
                    <td style={{ ...bodyCellStyle, borderBottom: "1px solid #E5E7EB" }}>{row.id}</td>
                    <td style={{ ...bodyCellStyle, borderBottom: "1px solid #E5E7EB" }}>{row.nhiNumber}</td>
                    <td style={{ ...bodyCellStyle, borderBottom: "1px solid #E5E7EB" }}>{row.patientName}</td>
                    <td style={{ ...bodyCellStyle, borderBottom: "1px solid #E5E7EB" }}>{row.date}</td>
                    <td style={{ ...bodyVersionCellStyle, borderBottom: "1px solid #E5E7EB" }}>{row.versionNumber}</td>
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
                ))}
              </>
            )}
          </tbody>
        </table>
      </div>

      {!loading && !error && totalCount > 0 && (
        <TablePagination
          page={page}
          totalCount={totalCount}
          pageSize={PAGE_SIZE}
          onPageChange={setPage}
        />
      )}
    </div>
  );
}