"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Header() {
  const router = useRouter();
  const [staffName, setStaffName] = useState("Loading...");
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileHovered, setProfileHovered] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    if (!menuOpen) return;
    function handleOutsideClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [menuOpen]);

  function handleLogOut() {
    localStorage.removeItem("staffInfo");
    setMenuOpen(false);
    router.push("/login");
  }

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
      {/* LEFT (Clickable Home → Dashboard) */}
      <Link href="/dashboard" style={{ textDecoration: "none" }}>
        <div
          style={{
            cursor: "pointer",
            transition: "all 0.2s ease",
            display: "inline-block",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.opacity = "0.8";
            e.currentTarget.style.transform = "scale(1.03)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.opacity = "1";
            e.currentTarget.style.transform = "scale(1)";
          }}
        >
          <div style={{ fontSize: "28px", fontWeight: 700, color: "#FFFFFF" }}>
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
      </Link>

      {/* RIGHT — profile menu */}
      <div ref={menuRef} style={{ position: "relative" }}>
        <button
          type="button"
          aria-haspopup="menu"
          aria-expanded={menuOpen}
          aria-label={`Profile menu for ${staffName}`}
          onClick={() => setMenuOpen((o) => !o)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "14px",
            margin: 0,
            padding: "8px 10px",
            border: "none",
            borderRadius: "10px",
            backgroundColor:
              menuOpen || profileHovered ? "rgba(255,255,255,0.12)" : "transparent",
            cursor: "pointer",
            color: "inherit",
            fontFamily: "inherit",
          }}
          onMouseEnter={() => setProfileHovered(true)}
          onMouseLeave={() => setProfileHovered(false)}
        >
          <span
            style={{
              fontSize: "18px",
              color: "#AEB9D3",
            }}
          >
            {staffName}
          </span>

          <div
            style={{
              width: "58px",
              height: "58px",
              borderRadius: "50%",
              border: "4px solid #7E90BA",
              position: "relative",
              flexShrink: 0,
            }}
          >
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
        </button>

        {menuOpen && (
          <div
            role="menu"
            aria-label="Account actions"
            style={{
              position: "absolute",
              top: "calc(100% + 8px)",
              right: 0,
              minWidth: "200px",
              backgroundColor: "#FFFFFF",
              borderRadius: "8px",
              boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
              padding: "8px",
              zIndex: 100,
            }}
          >
            <button
              type="button"
              role="menuitem"
              onClick={handleLogOut}
              style={{
                width: "100%",
                padding: "12px 14px",
                fontSize: "15px",
                fontWeight: 400,
                fontFamily: "inherit",
                color: "#DC2626",
                backgroundColor: "transparent",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                textAlign: "left",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "rgba(220, 38, 38, 0.08)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
              }}
            >
              Log Out
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
