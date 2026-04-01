"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";

export type EnrichedAssessment = {
  assessment_id: number;
  assessment_date: string | null;
  status: string | null;
  clinician_name: string;
  ais_grade: string;
};

type Props = {
  assessments: EnrichedAssessment[];
  hasError: boolean;
  errorMessage?: string;
};

function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return dateString;
  return date.toLocaleDateString("en-NZ", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function formatAisGrade(grade: string): string {
  if (!grade || grade === "N/A") return "N/A";
  const upper = grade.toUpperCase().trim();
  if (upper.startsWith("GRADE")) return upper;
  return `GRADE ${upper}`;
}

const STATUS_OPTIONS = ["ALL", "DRAFT", "FINAL"] as const;

export default function AssessmentHistoryClient({
  assessments,
  hasError,
  errorMessage,
}: Props) {
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [filterOpen, setFilterOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setFilterOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filtered =
    filterStatus === "ALL"
      ? assessments
      : assessments.filter(
          (a) => a.status?.toUpperCase() === filterStatus
        );

  return (
    <div>
      {/* Header row with title and action buttons */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 12,
        }}
      >
        <h2
          style={{
            fontSize: 18,
            fontWeight: 700,
            color: "#33476D",
            margin: 0,
          }}
        >
          Assessment History
        </h2>

        <div style={{ display: "flex", gap: 12 }}>
          {/* Filter dropdown */}
          <div style={{ position: "relative" }} ref={dropdownRef}>
            <button
              onClick={() => setFilterOpen(!filterOpen)}
              style={{
                padding: "8px 16px",
                background: "white",
                border: "2px solid #2f3e5c",
                borderRadius: 4,
                fontSize: 14,
                fontWeight: 500,
                color: "#2f3e5c",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              Filter
              <span style={{ fontSize: 10, lineHeight: 1 }}>&#9660;</span>
            </button>

            {filterOpen && (
              <div
                style={{
                  position: "absolute",
                  top: "100%",
                  right: 0,
                  marginTop: 4,
                  background: "white",
                  border: "2px solid #2f3e5c",
                  borderRadius: 4,
                  zIndex: 10,
                  minWidth: 130,
                  boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
                  overflow: "hidden",
                }}
              >
                {STATUS_OPTIONS.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => {
                      setFilterStatus(opt);
                      setFilterOpen(false);
                    }}
                    style={{
                      display: "block",
                      width: "100%",
                      padding: "10px 16px",
                      border: "none",
                      background:
                        filterStatus === opt ? "#e8ecf2" : "white",
                      textAlign: "left",
                      fontSize: 14,
                      cursor: "pointer",
                      color: "#2f3e5c",
                      fontWeight: filterStatus === opt ? 600 : 400,
                    }}
                  >
                    {opt === "ALL"
                      ? "All"
                      : opt.charAt(0) + opt.slice(1).toLowerCase()}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Export All PDFs */}
          <button
            style={{
              padding: "8px 16px",
              background: "white",
              border: "2px solid #2f3e5c",
              borderRadius: 4,
              fontSize: 14,
              fontWeight: 500,
              color: "#2f3e5c",
              cursor: "pointer",
            }}
          >
            Export All PDFs
          </button>
        </div>
      </div>

      {/* Assessment table */}
      <div style={{ border: "2px solid #2f3e5c", background: "white" }}>
        {/* Table header */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "2fr 2fr 1fr 1fr 1fr",
            padding: "12px 16px",
            borderBottom: "2px solid #2f3e5c",
            fontWeight: 700,
            fontSize: 13,
            textTransform: "uppercase",
            letterSpacing: "0.5px",
            color: "#33476D",
          }}
        >
          <div>Date</div>
          <div>Clinician Name</div>
          <div>AIS</div>
          <div>Status</div>
          <div></div>
        </div>

        {hasError && (
          <div style={{ padding: 16, color: "red" }}>
            Failed to load assessments: {errorMessage}
          </div>
        )}

        {!hasError && filtered.length === 0 && (
          <div style={{ padding: 16, color: "#6B7280" }}>
            No assessments found
          </div>
        )}

        {filtered.map((a) => (
          <div
            key={a.assessment_id}
            style={{
              display: "grid",
              gridTemplateColumns: "2fr 2fr 1fr 1fr 1fr",
              padding: "16px",
              borderBottom: "1px solid #e5e5e5",
              alignItems: "center",
              fontSize: 14,
            }}
          >
            <div>{formatDate(a.assessment_date)}</div>
            <div>{a.clinician_name}</div>
            <div>{formatAisGrade(a.ais_grade)}</div>
            <div style={{ textTransform: "uppercase" }}>
              {a.status ?? "Unknown"}
            </div>
            <div>
              <Link
                href={`/assessment?assessmentId=${a.assessment_id}`}
                style={{
                  display: "inline-block",
                  padding: "6px 20px",
                  border: "2px solid #2f3e5c",
                  borderRadius: 4,
                  color: "#2f3e5c",
                  textDecoration: "none",
                  fontSize: 13,
                  fontWeight: 500,
                  background: "white",
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
