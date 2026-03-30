
"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

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

// ─── Design tokens (must match page.tsx) ──────────────────────────────────────

const NAVY         = "#15284C";
const TABLE_BORDER = "#15284C";
const OPEN_BG      = "#D9DDE3";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(ds: string | null | undefined): string {
  if (!ds) return "N/A";
  const d = new Date(ds);
  if (Number.isNaN(d.getTime())) return ds;
  return d.toLocaleDateString("en-NZ", { day: "2-digit", month: "long", year: "numeric" });
}

function displayStatus(status: string | null | undefined): string {
  if (!status) return "Unknown";
  const u = status.toUpperCase();
  if (u === "FINALISED" || u === "FINALIZED") return "FINAL";
  return u;
}

// ─── Component ────────────────────────────────────────────────────────────────

type Props = {
  assessments: AssessmentDisplay[];
};

export default function AssessmentHistoryPanel({ assessments }: Props) {
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);
  const [draft, setDraft] = useState<Filters>(EMPTY_FILTERS);
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function onMouseDown(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", onMouseDown);
    return () => document.removeEventListener("mousedown", onMouseDown);
  }, [open]);

  // Sync draft when opening
  function handleOpen() {
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

  // Unique clinician names for the select
  const clinicianOptions = Array.from(new Set(assessments.map((a) => a.clinicianName))).sort();

  // Unique AIS grades present in the data
  const gradeOptions = Array.from(
    new Set(assessments.map((a) => (a.alsGrade ?? "").toUpperCase()).filter(Boolean))
  ).sort();

  // Unique statuses present in the data
  const statusOptions = Array.from(
    new Set(assessments.map((a) => displayStatus(a.status)).filter((s) => s !== "Unknown"))
  ).sort();

  // Apply filters
  const f = filters;
  const visible = assessments.filter((a) => {
    if (f.dateFrom && a.assessment_date && a.assessment_date < f.dateFrom) return false;
    if (f.dateTo   && a.assessment_date && a.assessment_date > f.dateTo)   return false;
    if (f.clinician && a.clinicianName !== f.clinician) return false;
    if (f.aisGrade  && (a.alsGrade ?? "").toUpperCase() !== f.aisGrade) return false;
    if (f.status    && displayStatus(a.status) !== f.status) return false;
    return true;
  });

  const activeCount = [f.dateFrom, f.dateTo, f.clinician, f.aisGrade, f.status].filter(Boolean).length;

  return (
    <div style={{ minWidth: 0 }}>

      {/* Heading row */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 14,
        flexWrap: "wrap",
        gap: 12,
      }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, margin: 0, color: NAVY }}>Assessment History</h2>

        <div style={{ display: "flex", gap: 10 }}>

          {/* Filter button + dropdown */}
          <div ref={dropdownRef} style={{ position: "relative" }}>
            <button
              onClick={handleOpen}
              style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: "8px 18px",
                backgroundColor: open ? "#F0F4F8" : "#FFFFFF",
                border: `1px solid ${TABLE_BORDER}`,
                color: NAVY,
                fontWeight: 500, fontSize: 14,
                cursor: "pointer",
              }}
            >
              Filter
              {activeCount > 0 && (
                <span style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 18, height: 18,
                  borderRadius: "50%",
                  backgroundColor: NAVY,
                  color: "#fff",
                  fontSize: 11,
                  fontWeight: 700,
                  marginLeft: 2,
                }}>
                  {activeCount}
                </span>
              )}
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={NAVY} strokeWidth="2.5">
                <polyline points={open ? "18 15 12 9 6 15" : "6 9 12 15 18 9"} />
              </svg>
            </button>

            {open && (
              <div style={{
                position: "absolute",
                top: "calc(100% + 6px)",
                right: 0,
                zIndex: 100,
                backgroundColor: "#FFFFFF",
                border: `1px solid ${TABLE_BORDER}`,
                padding: "20px",
                minWidth: 320,
                boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
              }}>

                <p style={{ margin: "0 0 14px 0", fontWeight: 700, fontSize: 13, color: NAVY, letterSpacing: "0.04em" }}>
                  FILTER BY
                </p>

                {/* Date range */}
                <div style={{ marginBottom: 14 }}>
                  <label style={labelStyle}>Date range</label>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <input
                      type="date"
                      value={draft.dateFrom}
                      onChange={(e) => setDraft((d) => ({ ...d, dateFrom: e.target.value }))}
                      style={inputStyle}
                      placeholder="From"
                    />
                    <span style={{ color: NAVY, fontSize: 13 }}>–</span>
                    <input
                      type="date"
                      value={draft.dateTo}
                      onChange={(e) => setDraft((d) => ({ ...d, dateTo: e.target.value }))}
                      style={inputStyle}
                      placeholder="To"
                    />
                  </div>
                </div>

                {/* Clinician name */}
                <div style={{ marginBottom: 14 }}>
                  <label style={labelStyle}>Clinician name</label>
                  <select
                    value={draft.clinician}
                    onChange={(e) => setDraft((d) => ({ ...d, clinician: e.target.value }))}
                    style={selectStyle}
                  >
                    <option value="">All clinicians</option>
                    {clinicianOptions.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                {/* AIS grade */}
                <div style={{ marginBottom: 14 }}>
                  <label style={labelStyle}>AIS grade</label>
                  <select
                    value={draft.aisGrade}
                    onChange={(e) => setDraft((d) => ({ ...d, aisGrade: e.target.value }))}
                    style={selectStyle}
                  >
                    <option value="">All grades</option>
                    {gradeOptions.length > 0
                      ? gradeOptions.map((g) => (
                          <option key={g} value={g}>Grade {g}</option>
                        ))
                      : ["A", "B", "C", "D", "E"].map((g) => (
                          <option key={g} value={g}>Grade {g}</option>
                        ))
                    }
                  </select>
                </div>

                {/* Status */}
                <div style={{ marginBottom: 20 }}>
                  <label style={labelStyle}>Status</label>
                  <select
                    value={draft.status}
                    onChange={(e) => setDraft((d) => ({ ...d, status: e.target.value }))}
                    style={selectStyle}
                  >
                    <option value="">All statuses</option>
                    {statusOptions.length > 0
                      ? statusOptions.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))
                      : ["DRAFT", "FINAL"].map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))
                    }
                  </select>
                </div>

                {/* Actions */}
                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    onClick={applyFilters}
                    style={{
                      flex: 1,
                      padding: "9px 0",
                      backgroundColor: NAVY,
                      color: "#fff",
                      border: "none",
                      fontWeight: 600,
                      fontSize: 14,
                      cursor: "pointer",
                    }}
                  >
                    Apply
                  </button>
                  <button
                    onClick={clearFilters}
                    style={{
                      flex: 1,
                      padding: "9px 0",
                      backgroundColor: "#fff",
                      color: NAVY,
                      border: `1px solid ${TABLE_BORDER}`,
                      fontWeight: 500,
                      fontSize: 14,
                      cursor: "pointer",
                    }}
                  >
                    Clear
                  </button>
                </div>
              </div>
            )}
          </div>

          <button style={{
            padding: "8px 18px",
            backgroundColor: "#FFFFFF",
            border: `1px solid ${TABLE_BORDER}`,
            color: NAVY,
            fontWeight: 500, fontSize: 14,
            cursor: "pointer",
          }}>
            Export All PDFs
          </button>
        </div>
      </div>

      {/* Active filter summary */}
      {activeCount > 0 && (
        <div style={{ marginBottom: 10, fontSize: 13, color: NAVY, display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <span style={{ fontWeight: 600 }}>Active filters:</span>
          {f.dateFrom && <FilterTag label={`From ${f.dateFrom}`} onRemove={() => setFilters((p) => ({ ...p, dateFrom: "" }))} />}
          {f.dateTo   && <FilterTag label={`To ${f.dateTo}`}     onRemove={() => setFilters((p) => ({ ...p, dateTo: "" }))} />}
          {f.clinician && <FilterTag label={f.clinician}         onRemove={() => setFilters((p) => ({ ...p, clinician: "" }))} />}
          {f.aisGrade  && <FilterTag label={`Grade ${f.aisGrade}`} onRemove={() => setFilters((p) => ({ ...p, aisGrade: "" }))} />}
          {f.status    && <FilterTag label={f.status}            onRemove={() => setFilters((p) => ({ ...p, status: "" }))} />}
        </div>
      )}

      {/* Table */}
      <div style={{ border: `1px solid ${TABLE_BORDER}`, backgroundColor: "#FFFFFF" }}>

        {/* Column headers */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "1.8fr 2fr 1.2fr 1.4fr 90px",
          padding: "13px 20px",
          borderBottom: `1px solid ${TABLE_BORDER}`,
        }}>
          {(["DATE", "CLINICIAN NAME", "AIS", "STATUS", ""] as const).map((col) => (
            <div key={col} style={{ fontSize: 13, fontWeight: 700, letterSpacing: "0.05em", color: NAVY }}>
              {col}
            </div>
          ))}
        </div>

        {/* Empty / filtered-empty state */}
        {assessments.length === 0 && (
          <div style={{ padding: "28px 20px", color: "#6B7280", fontSize: 14 }}>
            No assessments found.
          </div>
        )}
        {assessments.length > 0 && visible.length === 0 && (
          <div style={{ padding: "28px 20px", color: "#6B7280", fontSize: 14 }}>
            No assessments match the current filters.{" "}
            <button
              onClick={clearFilters}
              style={{ background: "none", border: "none", color: NAVY, fontWeight: 600, cursor: "pointer", padding: 0, fontSize: 14 }}
            >
              Clear filters
            </button>
          </div>
        )}

        {/* Data rows */}
        {visible.map((a, i) => {
          const gradeLabel = a.alsGrade ? `GRADE ${a.alsGrade.toUpperCase()}` : "N/A";
          const isLast = i === visible.length - 1;
          return (
            <div key={a.assessment_id} style={{
              display: "grid",
              gridTemplateColumns: "1.8fr 2fr 1.2fr 1.4fr 90px",
              padding: "16px 20px",
              borderBottom: isLast ? "none" : "1px solid #E5E7EB",
              alignItems: "center",
            }}>
              <div style={{ fontSize: 14 }}>{formatDate(a.assessment_date)}</div>
              <div style={{ fontSize: 14 }}>{a.clinicianName}</div>
              <div style={{ fontSize: 14 }}>{gradeLabel}</div>
              <div style={{ fontSize: 14 }}>{displayStatus(a.status)}</div>
              <div>
                <Link href={`/assessment?assessmentId=${a.assessment_id}`} style={{
                  display: "inline-block",
                  padding: "6px 18px",
                  backgroundColor: OPEN_BG,
                  color: NAVY,
                  fontSize: 13,
                  fontWeight: 500,
                  textDecoration: "none",
                  border: "1px solid #C4C9D4",
                }}>
                  Open
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Shared styles ────────────────────────────────────────────────────────────

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: 12,
  fontWeight: 600,
  color: NAVY,
  marginBottom: 5,
  letterSpacing: "0.03em",
};

const inputStyle: React.CSSProperties = {
  flex: 1,
  padding: "7px 8px",
  fontSize: 13,
  border: `1px solid #B0BAC9`,
  color: NAVY,
  outline: "none",
  width: "100%",
  boxSizing: "border-box",
};

const selectStyle: React.CSSProperties = {
  width: "100%",
  padding: "7px 8px",
  fontSize: 13,
  border: `1px solid #B0BAC9`,
  color: NAVY,
  backgroundColor: "#fff",
  outline: "none",
  boxSizing: "border-box",
};

// ─── FilterTag ────────────────────────────────────────────────────────────────

function FilterTag({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span style={{
      display: "inline-flex",
      alignItems: "center",
      gap: 5,
      padding: "3px 8px",
      backgroundColor: "#E8EDF4",
      border: `1px solid #B0BAC9`,
      fontSize: 12,
      fontWeight: 500,
      color: NAVY,
    }}>
      {label}
      <button
        onClick={onRemove}
        aria-label={`Remove ${label} filter`}
        style={{
          background: "none", border: "none", cursor: "pointer",
          color: NAVY, padding: 0, fontSize: 14, lineHeight: 1,
          display: "flex", alignItems: "center",
        }}
      >
        ×
      </button>
    </span>
  );
}

