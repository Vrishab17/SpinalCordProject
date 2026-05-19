"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import Link from "next/link";
import AuthGuard from "@/components/AuthGuard";

// ─── Types ────────────────────────────────────────────────────────────────────

export type AssessmentDisplay = {
  assessment_id: number;
  assessment_date: string | null;
  status: string | null;
  clinicianName: string;
  alsGrade: string | null;
};

type Filters = {
  dateFrom: string;
  dateTo: string;
  clinician: string;
  aisGrade: string;
  status: string;
};

const EMPTY_FILTERS: Filters = {
  dateFrom: "",
  dateTo: "",
  clinician: "",
  aisGrade: "",
  status: "",
};

// ─── Design tokens (aligned with dashboard & `recentAssessments.tsx`) ───────────

const NAVY = "#15284C";
const BORDER = "#D6D6D6";
const ROW_DIVIDER = "#E5E7EB";
const LABEL_MUTED = "#6B7280";

/** Matches Recent Assessments "Filter" control on the dashboard. */
const dashboardFilterButtonStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 6,
  border: `1px solid ${BORDER}`,
  borderRadius: "6px",
  padding: "8px 12px",
  fontSize: "14px",
  fontWeight: 500,
  color: NAVY,
  backgroundColor: "#FFFFFF",
  cursor: "pointer",
  fontFamily: "inherit",
};

/** Matches dashboard `buttons.tsx` Search Patient secondary. */
const dashboardOutlinedControlStyle: CSSProperties = {
  padding: "10px 16px",
  backgroundColor: "#FFFFFF",
  border: `1px solid ${BORDER}`,
  borderRadius: "6px",
  color: NAVY,
  fontSize: "14px",
  fontWeight: 600,
  fontFamily: "inherit",
  cursor: "pointer",
};

const filterPanelStyle: CSSProperties = {
  position: "absolute",
  top: "calc(100% + 4px)",
  right: 0,
  backgroundColor: "#FFFFFF",
  border: `1px solid ${BORDER}`,
  borderRadius: "6px",
  boxShadow: "0 4px 12px rgba(0,0,0,0.10)",
  zIndex: 10,
  minWidth: "280px",
  maxWidth: "min(94vw, 400px)",
  padding: "12px",
  boxSizing: "border-box",
};

const filterFieldStyle: CSSProperties = {
  width: "100%",
  padding: "8px 10px",
  border: `1px solid ${BORDER}`,
  borderRadius: "6px",
  fontSize: "14px",
  color: NAVY,
  boxSizing: "border-box",
  fontFamily: "inherit",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

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

function displayStatus(status: string | null | undefined): string {
  if (!status) return "Unknown";
  const u = status.toUpperCase();
  if (u === "FINALISED" || u === "FINALIZED") return "FINAL";
  return u;
}

function isoDatePrefix(ds: string | null | undefined): string {
  if (!ds) return "";
  const t = ds.indexOf("T");
  return t >= 0 ? ds.slice(0, t) : ds.slice(0, 10);
}

// ─── Component ────────────────────────────────────────────────────────────────

type Props = {
  assessments: AssessmentDisplay[];
  nhiNumber: string;
};

export default function AssessmentHistoryPanel({
  assessments,
  nhiNumber,
}: Props) {
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);
  const [draft, setDraft] = useState<Filters>(EMPTY_FILTERS);
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onMouseDown(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", onMouseDown);
    return () => document.removeEventListener("mousedown", onMouseDown);
  }, [open]);

  function handleToggleFilter() {
    setDraft(filters);
    setOpen((v) => !v);
  }

  function applyFilters() {
    setFilters(draft);
    setOpen(false);
  }

  function clearFilters() {
    const empty = { ...EMPTY_FILTERS };
    setDraft(empty);
    setFilters(empty);
    setOpen(false);
  }

  const clinicianOptions = Array.from(
    new Set(assessments.map((a) => a.clinicianName))
  ).sort();

  const gradeOptions = Array.from(
    new Set(
      assessments.map((a) => (a.alsGrade ?? "").toUpperCase()).filter(Boolean)
    )
  ).sort();

  const statusOptions = Array.from(
    new Set(
      assessments
        .map((a) => displayStatus(a.status))
        .filter((s) => s !== "Unknown")
    )
  ).sort();

  const f = filters;

  const visible = assessments.filter((a) => {
    const dateKey = isoDatePrefix(a.assessment_date);
    if (f.dateFrom && dateKey && dateKey < f.dateFrom) return false;
    if (f.dateTo && dateKey && dateKey > f.dateTo) return false;
    if (f.clinician && a.clinicianName !== f.clinician) return false;
    if (f.aisGrade && (a.alsGrade ?? "").toUpperCase() !== f.aisGrade)
      return false;
    if (f.status && displayStatus(a.status) !== f.status) return false;
    return true;
  });

  const activeCount = [
    f.dateFrom,
    f.dateTo,
    f.clinician,
    f.aisGrade,
    f.status,
  ].filter(Boolean).length;

  const menuSectionHeading: CSSProperties = {
    padding: "4px 0 8px",
    fontSize: "12px",
    fontWeight: 700,
    color: NAVY,
    letterSpacing: "0.04em",
    textTransform: "uppercase",
  };

  return (
    <AuthGuard>
      <div style={{ minWidth: 0 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 14,
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <h2 style={{ fontSize: 22, fontWeight: 700, margin: 0, color: NAVY }}>
            Assessment History
          </h2>

          <div style={{ display: "flex", gap: 12 }}>
            <Link
              href={`/assessment/new?nhi=${encodeURIComponent(nhiNumber)}`}
              style={{
                padding: "10px 16px",
                backgroundColor: NAVY,
                color: "#FFFFFF",
                borderRadius: "6px",
                fontWeight: 600,
                fontSize: "14px",
                textDecoration: "none",
                display: "flex",
                alignItems: "center",
                fontFamily: "inherit",
              }}
            >
              + New Assessment
            </Link>

            <div ref={dropdownRef} style={{ position: "relative" }}>
              <button
                type="button"
                aria-haspopup="dialog"
                aria-expanded={open}
                onClick={handleToggleFilter}
                style={{
                  ...dashboardFilterButtonStyle,
                  ...(open ? { backgroundColor: "#F8FAFC" } : {}),
                }}
              >
                Filter
                {activeCount > 0 ? (
                  <span
                    aria-hidden
                    style={{
                      minWidth: "18px",
                      height: "18px",
                      padding: "0 5px",
                      borderRadius: "9px",
                      backgroundColor: NAVY,
                      color: "#FFFFFF",
                      fontSize: "11px",
                      fontWeight: 600,
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {activeCount}
                  </span>
                ) : null}
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 12 12"
                  fill="none"
                  aria-hidden
                  style={{
                    transform: open ? "rotate(180deg)" : "rotate(0deg)",
                    transition: "transform 0.15s ease",
                    flexShrink: 0,
                  }}
                >
                  <path
                    d="M2 4L6 8L10 4"
                    stroke="#15284C"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>

              {open ? (
                <div
                  role="dialog"
                  aria-label="Filter assessments"
                  style={filterPanelStyle}
                >
                  <div style={menuSectionHeading}>Date range</div>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: 10,
                    }}
                  >
                    <label
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 4,
                      }}
                    >
                      <span
                        style={{
                          fontSize: 12,
                          fontWeight: 600,
                          color: LABEL_MUTED,
                        }}
                      >
                        From
                      </span>
                      <input
                        type="date"
                        value={draft.dateFrom}
                        onChange={(e) =>
                          setDraft((d) => ({
                            ...d,
                            dateFrom: e.target.value,
                          }))
                        }
                        style={filterFieldStyle}
                      />
                    </label>
                    <label
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 4,
                      }}
                    >
                      <span
                        style={{
                          fontSize: 12,
                          fontWeight: 600,
                          color: LABEL_MUTED,
                        }}
                      >
                        To
                      </span>
                      <input
                        type="date"
                        value={draft.dateTo}
                        onChange={(e) =>
                          setDraft((d) => ({
                            ...d,
                            dateTo: e.target.value,
                          }))
                        }
                        style={filterFieldStyle}
                      />
                    </label>
                  </div>

                  <div
                    style={{
                      height: "1px",
                      backgroundColor: ROW_DIVIDER,
                      margin: "12px 0",
                    }}
                  />

                  <div style={menuSectionHeading}>Assessment</div>

                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 10,
                    }}
                  >
                    <label
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 4,
                      }}
                    >
                      <span
                        style={{
                          fontSize: 12,
                          fontWeight: 600,
                          color: LABEL_MUTED,
                        }}
                      >
                        Clinician
                      </span>
                      <select
                        value={draft.clinician}
                        onChange={(e) =>
                          setDraft((d) => ({
                            ...d,
                            clinician: e.target.value,
                          }))
                        }
                        style={filterFieldStyle}
                      >
                        <option value="">Any</option>
                        {clinicianOptions.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 4,
                      }}
                    >
                      <span
                        style={{
                          fontSize: 12,
                          fontWeight: 600,
                          color: LABEL_MUTED,
                        }}
                      >
                        AIS grade
                      </span>
                      <select
                        value={draft.aisGrade}
                        onChange={(e) =>
                          setDraft((d) => ({
                            ...d,
                            aisGrade: e.target.value,
                          }))
                        }
                        style={filterFieldStyle}
                      >
                        <option value="">Any</option>
                        {gradeOptions.map((g) => (
                          <option key={g} value={g}>
                            {g}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 4,
                      }}
                    >
                      <span
                        style={{
                          fontSize: 12,
                          fontWeight: 600,
                          color: LABEL_MUTED,
                        }}
                      >
                        Status
                      </span>
                      <select
                        value={draft.status}
                        onChange={(e) =>
                          setDraft((d) => ({
                            ...d,
                            status: e.target.value,
                          }))
                        }
                        style={filterFieldStyle}
                      >
                        <option value="">Any</option>
                        {statusOptions.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      gap: 10,
                      justifyContent: "flex-end",
                      marginTop: 14,
                      flexWrap: "wrap",
                    }}
                  >
                    <button
                      type="button"
                      onClick={clearFilters}
                      style={dashboardOutlinedControlStyle}
                    >
                      Clear
                    </button>
                    <button
                      type="button"
                      onClick={applyFilters}
                      style={{
                        padding: "10px 16px",
                        borderRadius: "6px",
                        backgroundColor: NAVY,
                        border: `1px solid ${NAVY}`,
                        color: "#FFFFFF",
                        fontWeight: 600,
                        fontSize: "14px",
                        fontFamily: "inherit",
                        cursor: "pointer",
                      }}
                    >
                      Apply
                    </button>
                  </div>
                </div>
              ) : null}
            </div>

            <button type="button" style={dashboardOutlinedControlStyle}>
              Export All PDFs
            </button>
          </div>
        </div>

        <div
          style={{
            border: `1px solid ${BORDER}`,
            borderRadius: "6px",
            backgroundColor: "#FFFFFF",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1.8fr 2fr 1.2fr 1.4fr 90px",
              padding: "13px 20px",
              borderBottom: `1px solid ${BORDER}`,
            }}
          >
            {["DATE", "CLINICIAN NAME", "AIS", "STATUS", ""].map((col) => (
              <div key={col} style={{ fontWeight: 700, color: NAVY }}>
                {col}
              </div>
            ))}
          </div>

          {visible.length === 0 ? (
            <div
              style={{
                padding: "24px 20px",
                textAlign: "center",
                fontSize: "14px",
                color: LABEL_MUTED,
              }}
            >
              {assessments.length === 0
                ? "No assessments recorded for this patient yet."
                : "No assessments match these filters."}
            </div>
          ) : (
            visible.map((a) => (
              <div
                key={a.assessment_id}
                style={{
                  display: "grid",
                  gridTemplateColumns: "1.8fr 2fr 1.2fr 1.4fr 90px",
                  padding: "16px 20px",
                  borderBottom: `1px solid ${ROW_DIVIDER}`,
                  alignItems: "center",
                }}
              >
                <div>{formatDate(a.assessment_date)}</div>
                <div>{a.clinicianName}</div>
                <div>{a.alsGrade ? `GRADE ${a.alsGrade}` : "N/A"}</div>
                <div>{displayStatus(a.status)}</div>
                <div>
                  <Link
                    href={`/assessment?assessmentId=${a.assessment_id}`}
                    style={{
                      padding: "8px 14px",
                      backgroundColor: "#FFFFFF",
                      border: `1px solid ${BORDER}`,
                      borderRadius: "6px",
                      textDecoration: "none",
                      color: NAVY,
                      fontWeight: 500,
                      fontSize: "14px",
                      display: "inline-flex",
                      alignItems: "center",
                      fontFamily: "inherit",
                    }}
                  >
                    Open
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </AuthGuard>
  );
}
