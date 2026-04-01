"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function LoginPage() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Get staff_id as well
    const { data, error } = await supabase
      .from("Staff Credentials")
      .select("username, password_hash, staff_id")
      .eq("username", username)
      .maybeSingle();

    if (error) {
      setError("Invalid username or password. Please try again.");
      setLoading(false);
      return;
    }

    if (!data) {
      setError("Invalid username or password");
      setLoading(false);
      return;
    }

    if (data.password_hash !== password) {
      setError("Invalid username or password");
      setLoading(false);
      return;
    }

    // Get staff name immediately
    const { data: nameData } = await supabase
      .from("Staff Name")
      .select("prefix, given_name, preferred_name, family_name")
      .eq("STAFFstaff_id", data.staff_id)
      .maybeSingle();

    const firstName =
      nameData?.preferred_name || nameData?.given_name || "";

    const fullName = [
      nameData?.prefix,
      firstName,
      nameData?.family_name,
    ]
      .filter(Boolean)
      .join(" ");

    // Store EVERYTHING
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
        <div style={{ position: "absolute", top: 40, left: 40 }}>
          <div style={{ fontWeight: 600 }}>Health New Zealand</div>
          <div style={{ color: "#6EC1E4" }}>Te Whatu Ora</div>
        </div>

        <h1
          style={{
            fontSize: 56,
            lineHeight: 1.2,
            maxWidth: 500,
            fontWeight: 600,
          }}
        >
          Spinal Cord Injury
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
            width: 350,
            display: "flex",
            flexDirection: "column",
            gap: 20,
          }}
        >
          <div>
            <label style={{ fontSize: 12 }}>STAFF USERNAME</label>
            <input
              type="text"
              placeholder="jdoe"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                setError(null);
              }}
              style={{
                width: "100%",
                padding: "10px",
                border: "1px solid #ccc",
              }}
              required
            />
          </div>

          <div>
            <label style={{ fontSize: 12 }}>PASSWORD</label>
            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError(null);
              }}
              style={{
                width: "100%",
                padding: "10px",
                border: "1px solid #ccc",
              }}
              required
            />
          </div>

          {error && (
            <div
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
              padding: "12px",
              border: "none",
              cursor: "pointer",
            }}
          >
            {loading ? "Logging in..." : "Log In"}
          </button>
        </form>
      </div>
    </div>
  );
}