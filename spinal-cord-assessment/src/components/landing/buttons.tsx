"use client";

import { useRouter } from "next/navigation";

export default function Buttons() {
  const router = useRouter();

  return (
    <div style={{ display: "flex", gap: "12px" }}>
      <button
        onClick={() => router.push("/search")}
        style={{
          padding: "12px 18px",
          backgroundColor: "#FFFFFF",
          border: "1px solid #D6D6D6",
          color: "#15284C",
          fontSize: "14px",
          fontWeight: 400,
          cursor: "pointer",
        }}
      >
        Search Patient
      </button>

      <button
        onClick={() => router.push("/patients/new")}
        style={{
          padding: "12px 18px",
          backgroundColor: "#2D3E5E",
          color: "#FFFFFF",
          border: "none",
          fontSize: "14px",
          fontWeight: 400,
          cursor: "pointer",
        }}
      >
        + New Patient
      </button>
    </div>
  );
}