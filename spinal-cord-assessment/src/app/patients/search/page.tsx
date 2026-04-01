"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/layout/Header";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";

// ─── Types ─────────────────────────────────────────────────────────────────────

type PatientRow = {
  patient_id: number;
  nhi_number: string | null;
  date_of_birth: string | null;
  gender: string | null;
};

type PatientNameRow = {
  PATIENTpatient_id: number;
  given_name: string | null;
  family_name: string | null;
};

type PatientFound = {
  patientId: number;
  nhiNumber: string;
  fullName: string;
  initials: string;
  dob: string;
  dobRaw: string | null;
  age: string;
  gender: string;
  assessmentCount: number;
};

// ─── Design tokens ─────────────────────────────────────────────────────────────

const NAVY = "#15284C";
const BTN_PRIMARY = "#2D3E5E";
const BG = "#F6F4EC";
const BORDER = "#D6D6D6";
const LABEL_COL = "#6B7A96";
const GREEN = "#059669";

// ─── Helpers ───────────────────────────────────────────────────────────────────

function formatDateDisplay(ds: string | null | undefined): string {
  if (!ds) return "N/A";
  const d = new Date(ds);
  if (Number.isNaN(d.getTime())) return ds;
  return d.toLocaleDateString("en-NZ", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function calculateAge(dob: string | null | undefined): string {
  if (!dob) return "N/A";
  const birth = new Date(dob);
  if (Number.isNaN(birth.getTime())) return "N/A";
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return `${age}`;
}

function getInitials(fullName: string): string {
  const parts = fullName.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

const NHI_REGEX = /^[A-Za-z]{3}[A-Za-z0-9]{4}$/;

const NHI_SLOT_TYPES: ("letter" | "alphanumeric")[] = [
  "letter", "letter", "letter",
  "alphanumeric", "alphanumeric", "alphanumeric", "alphanumeric",
];

function isValidChar(char: string, type: "letter" | "alphanumeric"): boolean {
  if (type === "letter") return /^[A-Za-z]$/.test(char);
  return /^[A-Za-z0-9]$/.test(char);
}

// ─── Sub-components ────────────────────────────────────────────────────────────

function NhiFormatGuide({ value }: { value: string }) {
  return (
    <div style={{ display: "flex", gap: 5, marginTop: 10 }}>
      {NHI_SLOT_TYPES.map((type, i) => {
        const char = value[i] ?? "";
        const filled = char.length > 0;
        const valid = filled && isValidChar(char, type);
        const invalid = filled && !valid;

        let borderColor = "#D6D6D6";
        let bg = "#FAFAFA";
        let color = "#9CA3AF";
        let label = type === "letter" ? "A" : "X";

        if (valid) {
          borderColor = GREEN;
          bg = "#F0FDF4";
          color = NAVY;
          label = char;
        } else if (invalid) {
          borderColor = "#EF4444";
          bg = "#FEF2F2";
          color = "#EF4444";
          label = char;
        } else if (filled) {
          color = NAVY;
          label = char;
        }

        return (
          <div
            key={i}
            style={{
              width: 38,
              height: 40,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: `1.5px solid ${borderColor}`,
              borderRadius: 6,
              fontSize: filled ? 16 : 12,
              fontWeight: filled ? 700 : 500,
              color,
              backgroundColor: bg,
              transition: "all 0.15s ease",
              fontFamily: filled
                ? '"SF Mono", "Fira Code", Menlo, Consolas, monospace'
                : "inherit",
            }}
          >
            {label}
          </div>
        );
      })}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          marginLeft: 8,
          fontSize: 12,
          color: LABEL_COL,
        }}
      >
        {value.length === 0 && "3 letters + 4 alphanumeric"}
        {value.length > 0 && value.length < 7 && `${7 - value.length} more`}
        {value.length >= 7 && NHI_REGEX.test(value) && (
          <span style={{ color: GREEN, display: "flex", alignItems: "center", gap: 4 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            Valid format
          </span>
        )}
        {value.length >= 7 && !NHI_REGEX.test(value) && (
          <span style={{ color: "#EF4444" }}>Invalid format</span>
        )}
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div
      className="search-result-slide-in"
      style={{
        width: "100%",
        maxWidth: 640,
        marginTop: 22,
        backgroundColor: "#FFFFFF",
        border: `1px solid ${BORDER}`,
        borderRadius: 10,
        padding: "30px 40px 28px",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
        <div className="skeleton-bar" style={{ width: 24, height: 24, borderRadius: "50%" }} />
        <div className="skeleton-bar" style={{ width: 160, height: 18 }} />
        <div style={{ flex: 1 }} />
        <div className="skeleton-bar" style={{ width: 80, height: 24, borderRadius: 20 }} />
      </div>
      <div style={{ borderTop: `1px solid ${BORDER}`, paddingTop: 20, display: "grid", rowGap: 16 }}>
        {[140, 100, 120, 80, 160].map((w, i) => (
          <div key={i} style={{ display: "flex", gap: 20 }}>
            <div className="skeleton-bar" style={{ width: 100, height: 14 }} />
            <div className="skeleton-bar" style={{ width: w, height: 14 }} />
          </div>
        ))}
      </div>
      <div style={{ display: "flex", gap: 14, marginTop: 28 }}>
        <div className="skeleton-bar" style={{ flex: 1, height: 46, borderRadius: 8 }} />
        <div className="skeleton-bar" style={{ flex: 1, height: 46, borderRadius: 8 }} />
      </div>
    </div>
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API may be unavailable in insecure contexts
    }
  }

  return (
    <button
      onClick={handleCopy}
      title="Copy NHI number"
      style={{
        background: "none",
        border: "none",
        cursor: "pointer",
        padding: 2,
        marginLeft: 6,
        color: copied ? GREEN : LABEL_COL,
        transition: "color 0.15s ease",
        display: "inline-flex",
        alignItems: "center",
        verticalAlign: "middle",
      }}
    >
      {copied ? (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      ) : (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
        </svg>
      )}
    </button>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────

export default function PatientSearchPage() {
  const router = useRouter();

  const [nhiInput, setNhiInput] = useState("");
  const [inputFocused, setInputFocused] = useState(false);

  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [result, setResult] = useState<PatientFound | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [searchTimeMs, setSearchTimeMs] = useState<number | null>(null);

  const resultRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSearch = useCallback(async () => {
    setLoading(true);
    setSearched(true);
    setResult(null);
    setErrorMsg(null);
    setSearchTimeMs(null);

    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setErrorMsg("Database connection is not configured.");
      setLoading(false);
      return;
    }

    const nhiTrimmed = nhiInput.trim();
    const t0 = performance.now();

    if (nhiTrimmed.length === 0) {
      setErrorMsg("Please enter an NHI number.");
      setLoading(false);
      return;
    }

    if (!NHI_REGEX.test(nhiTrimmed)) {
      setErrorMsg(
        "Invalid NHI format. Expected 3 letters followed by 4 alphanumeric characters (e.g. WJQ31KO).",
      );
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("Patient")
        .select("patient_id, nhi_number, date_of_birth, gender")
        .ilike("nhi_number", nhiTrimmed)
        .maybeSingle();

      if (error) {
        setErrorMsg("Search failed. Please try again.");
        setLoading(false);
        return;
      }

      const patient = data as PatientRow | null;

      if (!patient) {
        setSearchTimeMs(Math.round(performance.now() - t0));
        setLoading(false);
        return;
      }

      const [nameRes, assessmentCountRes] = await Promise.all([
        supabase
          .from("Patient Name")
          .select("PATIENTpatient_id, given_name, family_name")
          .eq("PATIENTpatient_id", patient.patient_id)
          .limit(1)
          .maybeSingle(),
        supabase
          .from("Assessment")
          .select("assessment_id", { count: "exact", head: true })
          .eq("PATIENTpatient_id", patient.patient_id),
      ]);

      const name = nameRes.data as PatientNameRow | null;

      const fullName =
        name && (name.family_name || name.given_name)
          ? `${name.given_name ?? ""} ${name.family_name ?? ""}`.trim()
          : "Unknown";

      setSearchTimeMs(Math.round(performance.now() - t0));

      setResult({
        patientId: patient.patient_id,
        nhiNumber: patient.nhi_number ?? "N/A",
        fullName,
        initials: getInitials(fullName),
        dob: formatDateDisplay(patient.date_of_birth),
        dobRaw: patient.date_of_birth,
        age: calculateAge(patient.date_of_birth),
        gender: patient.gender ?? "Unknown",
        assessmentCount: assessmentCountRes.count ?? 0,
      });

      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }), 100);
    } catch {
      setErrorMsg("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [nhiInput]);

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSearch();
    }
  }

  function handleClearInput() {
    setNhiInput("");
    setSearched(false);
    setResult(null);
    setErrorMsg(null);
    setSearchTimeMs(null);
    inputRef.current?.focus();
  }

  const nhiValid = NHI_REGEX.test(nhiInput.trim());

  // ─── Render ──────────────────────────────────────────────────────────────────

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: BG,
        color: NAVY,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Header />

      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "48px 24px 60px",
        }}
      >
        {/* Back link */}
        <div style={{ width: "100%", maxWidth: 640, marginBottom: 20 }}>
          <button
            onClick={() => router.push("/")}
            className="btn"
            style={{
              background: "none",
              border: "none",
              color: LABEL_COL,
              fontSize: 14,
              fontWeight: 500,
              padding: 0,
              fontFamily: "inherit",
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
            Back to Dashboard
          </button>
        </div>

        {/* ── Search Card ───────────────────────────────────────────────────── */}
        <div
          style={{
            width: "100%",
            maxWidth: 640,
            backgroundColor: "#FFFFFF",
            border: `1px solid ${BORDER}`,
            borderRadius: 10,
            padding: "36px 40px 32px",
            boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
          }}
        >
          {/* Title row with icon */}
          <div style={{ display: "flex", alignItems: "flex-start", gap: 14, marginBottom: 4 }}>
            <div style={{
              width: 42,
              height: 42,
              borderRadius: 10,
              backgroundColor: "#EEF2F7",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              marginTop: 2,
            }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={BTN_PRIMARY} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </div>
            <div>
              <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0, color: NAVY }}>
                Patient Lookup
              </h1>
              <p style={{ fontSize: 14, color: LABEL_COL, margin: "4px 0 0 0" }}>
                Enter NHI Number to find patient records
              </p>
            </div>
          </div>

          {/* Divider */}
          <div style={{ height: 1, backgroundColor: BORDER, margin: "22px 0 24px 0" }} />

          {/* NHI field */}
          <div style={{ marginBottom: 8 }}>
            <label
              style={{
                display: "block",
                fontSize: 13,
                fontWeight: 600,
                color: NAVY,
                marginBottom: 8,
                letterSpacing: "0.04em",
              }}
            >
              NHI NUMBER
            </label>
            <div style={{ position: "relative" }}>
              <input
                ref={inputRef}
                type="text"
                className="patient-lookup-nhi-input"
                placeholder="E.g. WJQ31KO"
                value={nhiInput}
                onChange={(e) => {
                  const val = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 7);
                  setNhiInput(val);
                  if (errorMsg) setErrorMsg(null);
                }}
                onKeyDown={handleKeyDown}
                onFocus={() => setInputFocused(true)}
                onBlur={() => setInputFocused(false)}
                maxLength={7}
                style={{
                  width: "100%",
                  padding: "14px 44px 14px 16px",
                  border: `1.5px solid ${inputFocused ? BTN_PRIMARY : BORDER}`,
                  borderRadius: 8,
                  fontSize: 18,
                  color: NAVY,
                  fontFamily: '"SF Mono", "Fira Code", Menlo, Consolas, monospace',
                  letterSpacing: "0.12em",
                  boxSizing: "border-box",
                  outline: "none",
                  backgroundColor: "#F8F8F8",
                  boxShadow: inputFocused ? `0 0 0 3px rgba(45, 62, 94, 0.1)` : "none",
                  transition: "border-color 0.15s ease, box-shadow 0.15s ease",
                }}
              />
              {/* Clear button */}
              {nhiInput.length > 0 && (
                <button
                  onClick={handleClearInput}
                  tabIndex={-1}
                  style={{
                    position: "absolute",
                    right: 12,
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: 2,
                    color: "#9CA3AF",
                    display: "flex",
                    alignItems: "center",
                    transition: "color 0.15s ease",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = NAVY)}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "#9CA3AF")}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="15" y1="9" x2="9" y2="15" />
                    <line x1="9" y1="9" x2="15" y2="15" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* Format guide */}
          <NhiFormatGuide value={nhiInput} />

          {/* Keyboard hint */}
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginTop: 20,
            marginBottom: 4,
          }}>
            <span style={{ fontSize: 12, color: "#B0B0B0" }}>
              <kbd style={{
                display: "inline-block",
                padding: "1px 6px",
                border: "1px solid #D6D6D6",
                borderRadius: 4,
                fontSize: 11,
                fontFamily: "inherit",
                backgroundColor: "#F5F5F5",
                color: "#888",
                marginRight: 4,
              }}>
                Enter
              </kbd>
              to search
            </span>
            {nhiInput.length > 0 && (
              <span style={{ fontSize: 12, color: LABEL_COL }}>
                {nhiInput.length}/7
              </span>
            )}
          </div>

          {/* Search button */}
          <button
            className="btn"
            onClick={handleSearch}
            disabled={loading || (nhiInput.length > 0 && !nhiValid)}
            style={{
              width: "100%",
              padding: "15px 20px",
              backgroundColor: (nhiInput.length > 0 && !nhiValid) ? "#9CA3AF" : BTN_PRIMARY,
              color: "#FFFFFF",
              border: "none",
              borderRadius: 8,
              fontSize: 16,
              fontWeight: 600,
              fontFamily: "inherit",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              opacity: loading ? 0.7 : 1,
              marginTop: 8,
              transition: "background-color 0.2s ease",
            }}
          >
            {loading ? (
              <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span className="search-spinner" />
                Searching…
              </span>
            ) : (
              <>
                <svg
                  width="17"
                  height="17"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                Search NHI FHIR
              </>
            )}
          </button>
        </div>

        {/* ── Error Message ─────────────────────────────────────────────────── */}
        {errorMsg && (
          <div
            className="search-result-slide-in"
            style={{
              width: "100%",
              maxWidth: 640,
              marginTop: 18,
              padding: "14px 20px",
              backgroundColor: "#FEF2F2",
              border: "1px solid #FECACA",
              borderRadius: 10,
              fontSize: 14,
              color: "#991B1B",
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            {errorMsg}
          </div>
        )}

        {/* ── Loading Skeleton ──────────────────────────────────────────────── */}
        {loading && <LoadingSkeleton />}

        {/* ── Not Found ─────────────────────────────────────────────────────── */}
        {searched && !loading && !result && !errorMsg && (
          <div
            className="search-result-slide-in"
            style={{
              width: "100%",
              maxWidth: 640,
              marginTop: 22,
              textAlign: "center",
              padding: "36px 24px",
              backgroundColor: "#FFFFFF",
              border: `1px solid ${BORDER}`,
              borderRadius: 10,
            }}
          >
            <div style={{
              width: 56,
              height: 56,
              borderRadius: "50%",
              backgroundColor: "#FEF2F2",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 14px",
            }}>
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#DC2626"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
                <line x1="8" y1="8" x2="14" y2="14" />
                <line x1="14" y1="8" x2="8" y2="14" />
              </svg>
            </div>
            <p style={{ fontSize: 17, fontWeight: 600, color: NAVY, margin: "0 0 6px 0" }}>
              No patient found
            </p>
            <p style={{ fontSize: 14, color: LABEL_COL, margin: "0 0 16px 0" }}>
              No records match NHI number <strong style={{ fontFamily: '"SF Mono", Menlo, monospace', letterSpacing: "0.05em" }}>{nhiInput}</strong>
            </p>
            {searchTimeMs !== null && (
              <p style={{ fontSize: 12, color: "#B0B0B0", margin: "0 0 16px 0" }}>
                Searched in {searchTimeMs}ms
              </p>
            )}
            <button
              className="btn"
              onClick={handleClearInput}
              style={{
                padding: "10px 24px",
                backgroundColor: BTN_PRIMARY,
                color: "#FFFFFF",
                border: "none",
                borderRadius: 8,
                fontSize: 14,
                fontWeight: 600,
                fontFamily: "inherit",
              }}
            >
              Try Another Search
            </button>
          </div>
        )}

        {/* ── Patient Found Card ────────────────────────────────────────────── */}
        {result && (
          <div
            ref={resultRef}
            className="search-result-slide-in"
            style={{
              width: "100%",
              maxWidth: 640,
              marginTop: 22,
              backgroundColor: "#FFFFFF",
              border: `1px solid ${BORDER}`,
              borderRadius: 10,
              padding: "30px 40px 28px",
              boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
            }}
          >
            {/* Header row */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 22,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={GREEN} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
                <span style={{ fontSize: 20, fontWeight: 700, color: NAVY }}>
                  Patient Found
                </span>
              </div>
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 5,
                  padding: "4px 14px",
                  border: `1.5px solid ${GREEN}`,
                  borderRadius: 20,
                  fontSize: 12,
                  fontWeight: 600,
                  color: GREEN,
                  letterSpacing: "0.04em",
                }}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                VERIFIED
              </span>
            </div>

            {/* Patient header with avatar */}
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
              padding: "18px 20px",
              backgroundColor: "#F8FAFC",
              borderRadius: 10,
              marginBottom: 20,
            }}>
              {/* Initials avatar */}
              <div style={{
                width: 52,
                height: 52,
                borderRadius: "50%",
                backgroundColor: BTN_PRIMARY,
                color: "#FFFFFF",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 20,
                fontWeight: 700,
                letterSpacing: "0.03em",
                flexShrink: 0,
              }}>
                {result.initials}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 19, fontWeight: 700, color: NAVY }}>
                  {result.fullName}
                </div>
                <div style={{ fontSize: 13, color: LABEL_COL, marginTop: 2 }}>
                  <span style={{ fontFamily: '"SF Mono", Menlo, monospace', letterSpacing: "0.05em" }}>
                    {result.nhiNumber}
                  </span>
                  <CopyButton text={result.nhiNumber} />
                  <span style={{ margin: "0 8px", color: "#D6D6D6" }}>|</span>
                  {result.age !== "N/A" ? `${result.age} years old` : "Age unknown"}
                </div>
              </div>
              {/* Assessment count badge */}
              <div style={{
                textAlign: "center",
                padding: "8px 14px",
                backgroundColor: "#FFFFFF",
                borderRadius: 8,
                border: `1px solid ${BORDER}`,
              }}>
                <div style={{ fontSize: 22, fontWeight: 700, color: NAVY }}>
                  {result.assessmentCount}
                </div>
                <div style={{ fontSize: 11, color: LABEL_COL, fontWeight: 500 }}>
                  {result.assessmentCount === 1 ? "Assessment" : "Assessments"}
                </div>
              </div>
            </div>

            {/* Detail rows */}
            <div
              style={{
                display: "grid",
                rowGap: 14,
                borderTop: `1px solid ${BORDER}`,
                paddingTop: 20,
              }}
            >
              {(
                [
                  ["Full Name", result.fullName],
                  ["NHI Number", result.nhiNumber],
                  ["Date of Birth", result.dobRaw
                    ? `${result.dob} (${result.age} yrs)`
                    : result.dob],
                  ["Gender", result.gender],
                  ["GP", "N/A"],
                ] as const
              ).map(([label, value]) => (
                <div
                  key={label}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "150px 1fr",
                    alignItems: "baseline",
                  }}
                >
                  <span style={{ fontSize: 14, color: LABEL_COL, fontWeight: 500 }}>
                    {label}
                  </span>
                  <span
                    style={{
                      fontSize: 15,
                      color: NAVY,
                      fontWeight: label === "Full Name" ? 600 : 400,
                      fontFamily: label === "NHI Number"
                        ? '"SF Mono", "Fira Code", Menlo, Consolas, monospace'
                        : "inherit",
                      letterSpacing: label === "NHI Number" ? "0.05em" : undefined,
                    }}
                  >
                    {value}
                    {label === "NHI Number" && <CopyButton text={result.nhiNumber} />}
                  </span>
                </div>
              ))}
            </div>

            {/* Search time */}
            {searchTimeMs !== null && (
              <div style={{
                marginTop: 16,
                fontSize: 12,
                color: "#B0B0B0",
                display: "flex",
                alignItems: "center",
                gap: 4,
              }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                Found in {searchTimeMs}ms
              </div>
            )}

            {/* Action buttons */}
            <div style={{ display: "flex", gap: 14, marginTop: 20 }}>
              <button
                className="btn"
                onClick={() => router.push(`/history/${result.patientId}`)}
                style={{
                  flex: 1,
                  padding: "14px 20px",
                  backgroundColor: "#FFFFFF",
                  border: `1.5px solid ${BTN_PRIMARY}`,
                  borderRadius: 8,
                  color: BTN_PRIMARY,
                  fontSize: 15,
                  fontWeight: 600,
                  fontFamily: "inherit",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
                View History
              </button>
              <button
                className="btn"
                onClick={() => router.push(`/assessment/new?patientId=${result.patientId}`)}
                style={{
                  flex: 1,
                  padding: "14px 20px",
                  backgroundColor: BTN_PRIMARY,
                  border: "none",
                  borderRadius: 8,
                  color: "#FFFFFF",
                  fontSize: 15,
                  fontWeight: 600,
                  fontFamily: "inherit",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                New Assessment
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
