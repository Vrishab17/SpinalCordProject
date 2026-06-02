"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getLoggedInStaff, logoutStaff } from "@/lib/auth";

export default function Header() {
  const router = useRouter();
  const menuRef = useRef<HTMLDivElement>(null);
  const menuItemsRef = useRef<(HTMLButtonElement | null)[]>([]);
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

  useEffect(() => {
    if (menuOpen) {
      menuItemsRef.current[0]?.focus();
    }
  }, [menuOpen]);

  function handleMenuKeyDown(e: React.KeyboardEvent) {
    const items = menuItemsRef.current.filter(Boolean) as HTMLButtonElement[];
    const currentIdx = items.indexOf(document.activeElement as HTMLButtonElement);

    if (e.key === "ArrowDown") {
      e.preventDefault();
      const next = currentIdx < items.length - 1 ? currentIdx + 1 : 0;
      items[next]?.focus();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      const prev = currentIdx > 0 ? currentIdx - 1 : items.length - 1;
      items[prev]?.focus();
    } else if (e.key === "Escape") {
      setMenuOpen(false);
    }
  }

  async function handleLogout() {
    await logoutStaff();
    setMenuOpen(false);
    setStaffName("");
    router.replace("/login");
  }

  return (
    <header
      className="app-header"
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
      <Link
        href="/"
        className="header-logo"
        aria-label="Go to Assessment Dashboard"
        style={{ textDecoration: "none", color: "inherit" }}
      >
        <div
          className="app-header-brand"
          style={{
            fontSize: "28px",
            fontWeight: 700,
            marginBottom: "4px",
          }}
        >
          Health New Zealand
        </div>
        <div style={{ fontSize: "20px", fontWeight: 700, color: "#1FC2D5" }}>
          Te Whatu Ora
        </div>
      </Link>

      <div
        className="app-header-profile"
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
            className="app-header-staff-name"
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
            className="profile-menu"
            onKeyDown={handleMenuKeyDown}
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
              display: "flex",
              flexDirection: "column",
              gap: "4px",
              padding: "8px 0",
            }}
          >
            <button
              type="button"
              role="menuitem"
              tabIndex={-1}
              ref={(el) => {
                menuItemsRef.current[0] = el;
              }}
              className="profile-menu-item"
              style={{
                background: "none",
                border: "none",
                padding: "8px 16px",
                textAlign: "left",
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              Profile
            </button>
            <button
              type="button"
              role="menuitem"
              tabIndex={-1}
              ref={(el) => {
                menuItemsRef.current[1] = el;
              }}
              className="profile-menu-item"
              style={{
                background: "none",
                border: "none",
                padding: "8px 16px",
                textAlign: "left",
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              Settings
            </button>
            <hr style={{ margin: "4px 0", borderColor: "#E5E7EB" }} />
            <button
              type="button"
              role="menuitem"
              tabIndex={-1}
              ref={(el) => {
                menuItemsRef.current[2] = el;
              }}
              className="profile-menu-item"
              onClick={handleLogout}
              style={{
                background: "none",
                border: "none",
                padding: "8px 16px",
                textAlign: "left",
                cursor: "pointer",
                color: "#B91C1C",
                fontFamily: "inherit",
                fontWeight: 600,
              }}
            >
              Sign out
            </button>
          </div>
        ) : null}
      </div>
    </header>
  );
}
