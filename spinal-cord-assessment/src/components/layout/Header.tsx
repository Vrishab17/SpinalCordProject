"use client";

import { useEffect, useRef, useState } from "react";
import { getLoggedInStaff, logoutStaff } from "@/lib/auth";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Header() {
  const router = useRouter();
  const menuRef = useRef<HTMLDivElement>(null);
  const [staffName, setStaffName] = useState("Loading...");
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const staff = getLoggedInStaff();
    setStaffName(staff?.fullName ?? "Unknown User");
  }, []);

  useEffect(() => {
    if (!menuOpen) return;

    function onMouseDown(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", onMouseDown);
    return () => document.removeEventListener("mousedown", onMouseDown);
  }, [menuOpen]);

  async function handleLogout() {
    await logoutStaff();
    setMenuOpen(false);
    setStaffName("");
    router.replace("/login");
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

      <div
        ref={menuRef}
        style={{
          position: "relative",
          display: "flex",
          alignItems: "center",
          gap: "14px",
        }}
      >
        <button
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          aria-haspopup="menu"
          aria-expanded={menuOpen}
          aria-label="Profile menu"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "14px",
            padding: 0,
            border: "none",
            background: "transparent",
            cursor: "pointer",
            color: "inherit",
            fontFamily: "inherit",
          }}
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

        {menuOpen ? (
          <div
            role="menu"
            style={{
              position: "absolute",
              top: "calc(100% + 10px)",
              right: 0,
              minWidth: "200px",
              backgroundColor: "#FFFFFF",
              border: "1px solid #D6D6D6",
              borderRadius: "8px",
              boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
              overflow: "hidden",
              zIndex: 50,
            }}
          >
            <button
              type="button"
              role="menuitem"
              onClick={handleLogout}
              style={{
                width: "100%",
                padding: "16px 20px",
                border: "none",
                backgroundColor: "#FFFFFF",
                color: "#DC2626",
                fontSize: "16px",
                fontWeight: 600,
                textAlign: "left",
                cursor: "pointer",
                fontFamily: "inherit",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#FEF2F2";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "#FFFFFF";
              }}
            >
              Log Out
            </button>
          </div>
        ) : null}
      </div>
    </header>
  );
}
