"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

type PatientResult = {
  patientId: number;
  nhiNumber: string;
  name: string;
};

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function PatientSearchModal({ open, onClose }: Props) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<PatientResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (open) {
      setQuery("");
      setResults([]);
      setSearched(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  const search = useCallback(async (term: string) => {
    if (term.trim().length < 2) {
      setResults([]);
      setSearched(false);
      return;
    }

    setLoading(true);
    setSearched(true);

    const searchTerm = `%${term.trim()}%`;

    const { data: patientData } = await supabase
      .from("Patient")
      .select("patient_id, nhi_number")
      .ilike("nhi_number", searchTerm);

    const patients = (patientData ?? []) as { patient_id: number; nhi_number: string }[];
    const patientIds = patients.map((p) => p.patient_id);

    const { data: nameData } = await supabase
      .from("Patient Name")
      .select("PATIENTpatient_id, given_name, family_name");

    const names = (nameData ?? []) as { PATIENTpatient_id: number; given_name: string; family_name: string }[];

    const lowerTerm = term.trim().toLowerCase();
    const nameMatches = names.filter(
      (n) =>
        n.given_name.toLowerCase().includes(lowerTerm) ||
        n.family_name.toLowerCase().includes(lowerTerm)
    );
    const nameMatchIds = nameMatches.map((n) => n.PATIENTpatient_id);

    const allIds = [...new Set([...patientIds, ...nameMatchIds])];

    if (allIds.length === 0) {
      setResults([]);
      setLoading(false);
      return;
    }

    let allPatients = patients;
    const missingIds = allIds.filter((id) => !patientIds.includes(id));
    if (missingIds.length > 0) {
      const { data: extra } = await supabase
        .from("Patient")
        .select("patient_id, nhi_number")
        .in("patient_id", missingIds);
      allPatients = [...patients, ...((extra ?? []) as { patient_id: number; nhi_number: string }[])];
    }

    const patientMap = new Map(allPatients.map((p) => [p.patient_id, p.nhi_number]));
    const nameMap = new Map(names.map((n) => [n.PATIENTpatient_id, `${n.given_name} ${n.family_name}`]));

    const mapped: PatientResult[] = allIds.map((id) => ({
      patientId: id,
      nhiNumber: patientMap.get(id) ?? "N/A",
      name: nameMap.get(id) ?? `Patient #${id}`,
    }));

    setResults(mapped);
    setLoading(false);
  }, []);

  function handleInputChange(value: string) {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(value), 300);
  }

  function handleSelect(patientId: number) {
    onClose();
    router.push(`/history/${patientId}`);
  }

  function handleOverlayClick(e: React.MouseEvent) {
    if (e.target === e.currentTarget) onClose();
  }

  if (!open) return null;

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal-content" role="dialog" aria-label="Search patients" tabIndex={-1}>
        <div style={{ padding: "20px 20px 0" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <h2 style={{ fontSize: "18px", fontWeight: 700, margin: 0, color: "#15284C" }}>
              Search All Patients
            </h2>
            <button
              onClick={onClose}
              className="btn"
              aria-label="Close search"
              style={{
                background: "none",
                border: "none",
                fontSize: "22px",
                color: "#6B7280",
                padding: "4px",
                lineHeight: 1,
              }}
            >
              &times;
            </button>
          </div>
          <div style={{ position: "relative" }}>
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
              ref={inputRef}
              type="text"
              className="search-input"
              placeholder="Search by NHI number or patient name..."
              aria-label="Search patients"
              value={query}
              onChange={(e) => handleInputChange(e.target.value)}
            />
          </div>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "12px 20px 20px" }}>
          {loading ? (
            <div style={{ padding: "24px 0", textAlign: "center", color: "#6B7280", fontSize: "14px" }}>
              Searching...
            </div>
          ) : !searched ? (
            <div style={{ padding: "24px 0", textAlign: "center", color: "#9CA3AF", fontSize: "14px" }}>
              Type at least 2 characters to search
            </div>
          ) : results.length === 0 ? (
            <div style={{ padding: "24px 0", textAlign: "center", color: "#6B7280", fontSize: "14px" }}>
              No patients found matching &ldquo;{query}&rdquo;
            </div>
          ) : (
            <div>
              <div style={{ fontSize: "12px", color: "#6B7280", marginBottom: "8px", fontWeight: 500 }}>
                {results.length} result{results.length !== 1 ? "s" : ""}
              </div>
              {results.map((r) => (
                <button
                  key={r.patientId}
                  className="clickable-row"
                  onClick={() => handleSelect(r.patientId)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "16px",
                    width: "100%",
                    padding: "12px",
                    background: "none",
                    border: "none",
                    borderBottom: "1px solid #F3F4F6",
                    textAlign: "left",
                    fontSize: "14px",
                    color: "#15284C",
                    fontFamily: "inherit",
                    borderRadius: "6px",
                  }}
                >
                  <span style={{ fontWeight: 600, minWidth: "90px" }}>{r.nhiNumber}</span>
                  <span>{r.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
