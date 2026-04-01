"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";
import { hasSupabaseAuthSession } from "@/lib/staffSession";

export default function LoginPage() {
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (await hasSupabaseAuthSession()) {
        if (!cancelled) router.replace("/");
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setError("Database connection is not configured.");
      setLoading(false);
      return;
    }

    const { error: authError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (authError) {
      setError(
        authError.message.includes("Invalid login")
          ? "Invalid email or password."
          : authError.message
      );
      setLoading(false);
      return;
    }

    router.push("/");
  }

  return (
    <div style={{ display: "flex", height: "100vh" }}>
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
          <div style={{ fontWeight: 700, fontSize: 30 }}>Health New Zealand</div>
          <div style={{ color: "#6EC1E4", fontSize: 20 }}>Te Whatu Ora</div>
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
          <p
            style={{
              fontSize: 14,
              color: "#5A6A85",
              margin: 0,
              lineHeight: 1.5,
            }}
          >
            Sign in with the <strong>work email</strong> registered in Supabase Authentication.
            Your account must exist under Authentication → Users in the Supabase dashboard.
          </p>

          <div>
            <label htmlFor="staff-email" style={{ fontSize: 13, fontWeight: 500 }}>
              WORK EMAIL
            </label>
            <input
              id="staff-email"
              type="email"
              autoComplete="email"
              placeholder="name@health.govt.nz"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
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
              autoComplete="current-password"
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
