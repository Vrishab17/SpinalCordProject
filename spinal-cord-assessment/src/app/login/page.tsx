"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { hasValidStaffSession } from "@/lib/staffSession";

export default function LoginPage() {
  const router = useRouter();

  useEffect(() => {
    if (hasValidStaffSession()) {
      router.replace("/");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional: redirect-if-logged-in runs once
  }, []);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!supabase) {
      setError("Database connection is not configured.");
      setLoading(false);
      return;
    }

    const { data, error: queryError } = await supabase
      .from("Staff Credentials")
      .select("username, password_hash, STAFFstaff_id")
      .eq("username", username)
      .maybeSingle();

    if (queryError) {
      setError("Invalid username or password. Please try again.");
      setLoading(false);
      return;
    }

    if (!data) {
      setError("Invalid username or password");
      setLoading(false);
      return;
    }

    // TODO: Replace with server-side bcrypt comparison — plaintext comparison
    // is insecure and only acceptable during prototyping.
    if (data.password_hash !== password) {
      setError("Invalid username or password");
      setLoading(false);
      return;
    }

    const { data: nameData, error: nameError } = await supabase
      .from("Staff Name")
      .select("prefix, given_name, preferred_name, family_name")
      .eq("STAFFstaff_id", data.STAFFstaff_id)
      .maybeSingle();

    if (nameError) {
      console.error("Staff name lookup failed:", nameError.message);
    }

    const firstName =
      nameData?.preferred_name || nameData?.given_name || "";

    const fullName = [
      nameData?.prefix,
      firstName,
      nameData?.family_name,
    ]
      .filter(Boolean)
      .join(" ");

    localStorage.setItem(
      "staffInfo",
      JSON.stringify({
        username,
        fullName,
      })
    );

    router.push("/");
  }

  return (
    <div style={{ display: "flex", height: "100vh" }}>

      {/* LEFT PANEL */}
      <div
        style={{
          flex: 1,
          backgroundColor: "#2F3E5C",
          color: "white",
          padding: "60px 40px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          position: "relative",
        }}
      >
        <div style={{ position: "absolute", top: 20, left: 20 }}>
          <div style={{ fontWeight: 700, fontSize: 30 }}>
            Health New Zealand
          </div>
          <div style={{ color: "#6EC1E4", fontSize: 20 }}>
            Te Whatu Ora
          </div>
        </div>

        <h1
          style={{
            fontSize: 56,
            lineHeight: 1.2,
            maxWidth: 500,
            fontWeight: 600,
          }}
        >
          ISNCSCI / ASRU
          <br />
          Assessment Portal
        </h1>
      </div>

      {/* RIGHT PANEL */}
      <div
        style={{
          flex: 1,
          backgroundColor: "#F5F3EF",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <form
          onSubmit={handleLogin}
          style={{
            width: 420,
            display: "flex",
            flexDirection: "column",
            gap: 24,
          }}
        >
          <div>
            <label htmlFor="staff-username" style={{ fontSize: 13, fontWeight: 500 }}>
              STAFF USERNAME
            </label>
            <input
              id="staff-username"
              type="text"
              placeholder="jdoe"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                setError(null);
              }}
              style={{
                width: "100%",
                padding: "14px",
                border: "1px solid #ccc",
                fontSize: "16px",
                borderRadius: "6px",
              }}
              required
            />
          </div>

          <div>
            <label htmlFor="staff-password" style={{ fontSize: 13, fontWeight: 500 }}>
              PASSWORD
            </label>
            <input
              id="staff-password"
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError(null);
              }}
              style={{
                width: "100%",
                padding: "14px",
                border: "1px solid #ccc",
                fontSize: "16px",
                borderRadius: "6px",
              }}
              required
            />
          </div>

          {error && (
            <div
              role="alert"
              style={{
                backgroundColor: "#FEE2E2",
                color: "#991B1B",
                padding: "10px",
                borderRadius: "6px",
                fontSize: "14px",
                border: "1px solid #FCA5A5",
              }}
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              backgroundColor: "#2F3E5C",
              color: "white",
              padding: "14px",
              border: "none",
              cursor: "pointer",
              fontSize: "16px",
              borderRadius: "6px",
            }}
          >
            {loading ? "Logging in..." : "Log In"}
          </button>
        </form>
      </div>
    </div>
  );
}
