"use client";

import { useEffect, useState } from "react";

export default function Header() {
  const [staffName, setStaffName] = useState("Loading...");

  useEffect(() => {
    const staffInfo = localStorage.getItem("staffInfo");

    if (!staffInfo) {
      setStaffName("Unknown User");
      return;
    }

    try {
      const parsed = JSON.parse(staffInfo);
      setStaffName(parsed.fullName || "Unknown User");
    } catch {
      setStaffName("Unknown User");
    }
  }, []);

  return (
    <header
      style={{
        backgroundColor: "#33476D",
        color: "#FFFFFF",
        padding: "20px 24px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        width: "100%",
      }}
    >
      {/* LEFT */}
      <div>
        <div style={{ fontSize: "28px", fontWeight: 700 }}>
          Health New Zealand
        </div>
        <div
          style={{
            fontSize: "20px",
            fontWeight: 700,
            color: "#1FC2D5",
          }}
        >
          Te Whatu Ora
        </div>
      </div>

      {/* RIGHT */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "14px",
        }}
      >
        {/* Name */}
        <span
          style={{
            fontSize: "18px",
            color: "#AEB9D3",
          }}
        >
          {staffName}
        </span>

        {/* Person Icon */}
        <div
          style={{
            width: "58px",
            height: "58px",
            borderRadius: "50%",
            border: "4px solid #7E90BA",
            position: "relative",
          }}
        >
          {/* Head */}
          <div
            style={{
              width: "16px",
              height: "16px",
              borderRadius: "50%",
              backgroundColor: "#7E90BA",
              position: "absolute",
              top: "10px",
              left: "50%",
              transform: "translateX(-50%)",
            }}
          />

          {/* Body */}
          <div
            style={{
              width: "28px",
              height: "14px",
              borderRadius: "14px 14px 10px 10px",
              backgroundColor: "#7E90BA",
              position: "absolute",
              bottom: "10px",
              left: "50%",
              transform: "translateX(-50%)",
            }}
          />
        </div>
      </div>
    </header>
  );
}