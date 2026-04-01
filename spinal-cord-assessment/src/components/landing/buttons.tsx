"use client";

import { useState } from "react";
import PatientSearchModal from "./PatientSearchModal";

export default function Buttons() {
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <>
      <div style={{ display: "flex", gap: "12px" }}>
        <button
          className="btn"
          onClick={() => setSearchOpen(true)}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "12px 22px",
            backgroundColor: "#2D3E5E",
            border: "none",
            borderRadius: "8px",
            color: "#FFFFFF",
            fontSize: "14px",
            fontWeight: 600,
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          Search Patient
        </button>

        <button
          className="btn"
          style={{
            padding: "12px 22px",
            backgroundColor: "#FFFFFF",
            border: "1.5px solid #2D3E5E",
            borderRadius: "8px",
            color: "#2D3E5E",
            fontSize: "14px",
            fontWeight: 600,
          }}
        >
          + New Patient
        </button>
      </div>

      <PatientSearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
