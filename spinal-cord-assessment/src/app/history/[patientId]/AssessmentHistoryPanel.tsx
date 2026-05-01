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

// ─── Design tokens ────────────────────────────────────────────────────────────

const NAVY         = "#15284C";
const TABLE_BORDER = "#15284C";
const OPEN_BG      = "#D9DDE3";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(ds: string | null | undefined): string {
  if (!ds) return "N/A";
  const d = new Date(ds);
  if (Number.isNaN(d.getTime())) return ds;
  return d.toLocaleDateString("en-NZ", {
    day: "2-digit",
    month: "long",
    year: "numeric"
  });
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
  patientName: string;
  nhiNumber: string; // ✅ IMPORTANT (was missing before)
};

export default function AssessmentHistoryPanel({
  assessments,
  nhiNumber // ✅ needed for button
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
      assessments.map((a) => displayStatus(a.status)).filter((s) => s !== "Unknown")
    )
  ).sort();

  const f = filters;

  const visible = assessments.filter((a) => {
    if (f.dateFrom && a.assessment_date && a.assessment_date < f.dateFrom) return false;
    if (f.dateTo   && a.assessment_date && a.assessment_date > f.dateTo)   return false;
    if (f.clinician && a.clinicianName !== f.clinician) return false;
    if (f.aisGrade  && (a.alsGrade ?? "").toUpperCase() !== f.aisGrade) return false;
    if (f.status    && displayStatus(a.status) !== f.status) return false;
    return true;
  });

  const activeCount = [
    f.dateFrom,
    f.dateTo,
    f.clinician,
    f.aisGrade,
    f.status
  ].filter(Boolean).length;

  return (
    <div style={{ minWidth: 0 }}>

      {/* HEADER */}
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

        {/* 🔥 BUTTON ROW (ONLY CHANGE) */}
        <div style={{ display: "flex", gap: 10 }}>

          {/* + NEW ASSESSMENT */}
          <Link
            href={`/assessment/new?nhi=${nhiNumber}`}
            style={{
              padding: "8px 18px",
              backgroundColor: NAVY,
              color: "#FFFFFF",
              fontWeight: 500,
              fontSize: 14,
              textDecoration: "none",
              display: "flex",
              alignItems: "center",
            }}
          >
            + New Assessment
          </Link>

          {/* FILTER */}
          <div ref={dropdownRef} style={{ position: "relative" }}>
            <button
              onClick={handleOpen}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "8px 18px",
                backgroundColor: open ? "#F0F4F8" : "#FFFFFF",
                border: `1px solid ${TABLE_BORDER}`,
                color: NAVY,
                fontWeight: 500,
                fontSize: 14,
                cursor: "pointer",
              }}
            >
              Filter
            </button>
          </div>

          {/* EXPORT */}
          <button
            style={{
              padding: "8px 18px",
              backgroundColor: "#FFFFFF",
              border: `1px solid ${TABLE_BORDER}`,
              color: NAVY,
              fontWeight: 500,
              fontSize: 14,
              cursor: "pointer",
            }}
          >
            Export All PDFs
          </button>
        </div>
      </div>

      {/* ✅ TABLE — FULLY RESTORED */}
      <div style={{ border: `1px solid ${TABLE_BORDER}`, backgroundColor: "#FFFFFF" }}>

        {/* HEADERS */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.8fr 2fr 1.2fr 1.4fr 90px",
            padding: "13px 20px",
            borderBottom: `1px solid ${TABLE_BORDER}`,
          }}
        >
          {["DATE", "CLINICIAN NAME", "AIS", "STATUS", ""].map((col) => (
            <div key={col} style={{ fontWeight: 700, color: NAVY }}>
              {col}
            </div>
          ))}
        </div>

        {/* ROWS */}
        {visible.map((a) => (
          <div
            key={a.assessment_id}
            style={{
              display: "grid",
              gridTemplateColumns: "1.8fr 2fr 1.2fr 1.4fr 90px",
              padding: "16px 20px",
              borderBottom: "1px solid #E5E7EB",
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
                  padding: "6px 18px",
                  backgroundColor: OPEN_BG,
                  textDecoration: "none",
                  color: NAVY,
                }}
              >
                Open
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}