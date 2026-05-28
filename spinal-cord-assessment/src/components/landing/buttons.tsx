"use client";

import { useRouter } from "next/navigation";

export default function Buttons() {
  const router = useRouter();

  return (
    <div className="dashboard-buttons" style={{ display: "flex", gap: "12px" }}>
      <button
        className="responsive-button"
        type="button"
        onClick={() => router.push("/search")}
        style={{
          padding: "10px 16px",
          backgroundColor: "#FFFFFF",
          border: "1px solid #D6D6D6",
          borderRadius: "6px",
          color: "#15284C",
          fontSize: "14px",
          fontWeight: 600,
          fontFamily: "inherit",
          cursor: "pointer",
        }}
      >
        Search Patient
      </button>
    </div>
  );
}
