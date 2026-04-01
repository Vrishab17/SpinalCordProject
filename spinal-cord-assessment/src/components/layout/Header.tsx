"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

type GP = {
  title: string;
  given_name: string;
  family_name: string;
};

export default function Header() {
  const router = useRouter();
  const [gpName, setGpName] = useState("Loading...");
  const [menuOpen, setMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const menuItemsRef = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    async function fetchGP() {
      const { data: userData } = await supabase.auth.getUser();

      if (!userData?.user) {
        setGpName("Unknown User");
        return;
      }

      const { data, error } = await supabase
        .from("Staff")
        .select("title, given_name, family_name")
        .eq("user_id", userData.user.id)
        .single();

      if (error || !data) {
        setGpName("Unknown User");
        return;
      }

      const gp = data as GP;
      const formatted = `${gp.title} ${gp.given_name[0]}. ${gp.family_name}`;
      setGpName(formatted);
    }

    fetchGP();
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
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

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/");
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
      <div>
        <div
          style={{
            fontSize: "28px",
            fontWeight: 700,
            marginBottom: "4px",
          }}
        >
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

      <div ref={dropdownRef} style={{ position: "relative" }}>
        <button
          className="profile-trigger"
          aria-haspopup="menu"
          aria-expanded={menuOpen}
          aria-label="User menu"
          onClick={() => setMenuOpen((v) => !v)}
        >
          <span
            style={{
              fontSize: "18px",
              fontWeight: 400,
              color: "#AEB9D3",
            }}
          >
            {gpName}
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

          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#AEB9D3"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points={menuOpen ? "18 15 12 9 6 15" : "6 9 12 15 18 9"} />
          </svg>
        </button>

        {menuOpen && (
          <div
            className="profile-menu"
            role="menu"
            onKeyDown={handleMenuKeyDown}
          >
            <button
              className="profile-menu-item"
              role="menuitem"
              tabIndex={-1}
              ref={(el) => { menuItemsRef.current[0] = el; }}
            >
              Profile
            </button>
            <button
              className="profile-menu-item"
              role="menuitem"
              tabIndex={-1}
              ref={(el) => { menuItemsRef.current[1] = el; }}
            >
              Settings
            </button>
            <hr className="profile-menu-divider" />
            <button
              className="profile-menu-item"
              role="menuitem"
              tabIndex={-1}
              ref={(el) => { menuItemsRef.current[2] = el; }}
              onClick={handleSignOut}
              style={{ color: "#B91C1C" }}
            >
              Sign out
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
