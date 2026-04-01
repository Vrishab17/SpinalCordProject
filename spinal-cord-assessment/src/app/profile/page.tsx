"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/layout/Header";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";
import { getStaffIdForAuthUser } from "@/lib/staffDisplayName";
import { signOutSupabase } from "@/lib/staffSession";

// ─── Types ────────────────────────────────────────────────────────────────────

type StaffProfile = {
  staffId: number | null;
  /** Supabase Auth email (source of truth for sign-in). */
  signInEmail: string;
  username: string;
  fullName: string;
  prefix: string;
  givenName: string;
  preferredName: string;
  familyName: string;
  /** `Staff.email` when linked. */
  directoryEmail: string;
  hpiPractitioner: string;
  role: string;
  department: string;
  initials: string;
};

// ─── Design tokens ────────────────────────────────────────────────────────────

const NAVY = "#15284C";
const BG = "#F6F4EC";
const BORDER = "#D6D6D6";
const BTN_PRIMARY = "#2D3E5E";
const LABEL_COL = "#6B7A96";
const CARD_BG = "#FFFFFF";

const TITLE_PREFIXES = new Set([
  "dr", "dr.", "mr", "mr.", "mrs", "mrs.", "ms", "ms.", "miss",
  "prof", "prof.", "professor", "sir", "dame", "rev", "rev.",
]);

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getInitials(name: string): string {
  const parts = name.split(/\s+/).filter(Boolean);
  const meaningful = parts.filter((p) => !TITLE_PREFIXES.has(p.toLowerCase()));
  const source = meaningful.length > 0 ? meaningful : parts;
  if (source.length === 0) return "?";
  if (source.length === 1) return source[0][0].toUpperCase();
  return (source[0][0] + source[source.length - 1][0]).toUpperCase();
}

/** Split "Dr John Doe" → title + given + family (last token = surname). */
function parseDisplayName(fullName: string): {
  prefix: string;
  givenName: string;
  familyName: string;
} {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return { prefix: "", givenName: "", familyName: "" };
  let i = 0;
  let prefix = "";
  if (TITLE_PREFIXES.has(parts[0].toLowerCase())) {
    prefix = parts[0];
    i = 1;
  }
  const rest = parts.slice(i);
  if (rest.length === 0) return { prefix, givenName: "", familyName: "" };
  if (rest.length === 1) return { prefix, givenName: rest[0], familyName: "" };
  return {
    prefix,
    givenName: rest.slice(0, -1).join(" "),
    familyName: rest[rest.length - 1] ?? "",
  };
}

function mergeProfile(
  auth: { email: string; metaFullName?: string },
  db: {
    username?: string;
    prefix?: string;
    givenName?: string;
    preferredName?: string;
    familyName?: string;
    directoryEmail?: string;
    hpiPractitioner?: string;
    role?: string;
    department?: string;
  },
  staffId: number | null
): StaffProfile {
  const basisName =
    (auth.metaFullName ?? "").trim() ||
    auth.email.split("@")[0] ||
    "User";
  const parsed = parseDisplayName(basisName);
  const prefix = (db.prefix ?? "").trim() || parsed.prefix;
  const givenName = (db.givenName ?? "").trim() || parsed.givenName;
  const familyName = (db.familyName ?? "").trim() || parsed.familyName;
  const preferredName = (db.preferredName ?? "").trim();
  const composed = [prefix, preferredName || givenName, familyName].filter(Boolean).join(" ");
  const fullName =
    composed ||
    [prefix, givenName, familyName].filter(Boolean).join(" ") ||
    basisName ||
    "Unknown User";

  return {
    staffId,
    signInEmail: auth.email,
    username: (db.username ?? auth.email.split("@")[0] ?? "").trim(),
    fullName,
    prefix,
    givenName,
    preferredName,
    familyName,
    directoryEmail: (db.directoryEmail ?? "").trim(),
    hpiPractitioner: (db.hpiPractitioner ?? "").trim(),
    role: (db.role ?? "").trim(),
    department: (db.department ?? "").trim(),
    initials: getInitials(fullName),
  };
}

// ─── Icons ────────────────────────────────────────────────────────────────────

function IconUser() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function IconMail() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="M22 7l-10 7L2 7" />
    </svg>
  );
}

function IconBriefcase() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
      <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
    </svg>
  );
}

function IconHash() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="4" y1="9" x2="20" y2="9" />
      <line x1="4" y1="15" x2="20" y2="15" />
      <line x1="10" y1="3" x2="8" y2="21" />
      <line x1="16" y1="3" x2="14" y2="21" />
    </svg>
  );
}

type FieldRow = { label: string; value: string; icon?: React.ReactNode };

function ProfileSection({ title, fields }: { title: string; fields: FieldRow[] }) {
  if (fields.length === 0) return null;
  return (
    <div style={{ padding: "18px 28px" }}>
      <p
        style={{
          fontSize: 11,
          fontWeight: 700,
          color: LABEL_COL,
          letterSpacing: "0.08em",
          margin: "0 0 12px 0",
          textTransform: "uppercase",
        }}
      >
        {title}
      </p>
      <div style={{ display: "grid", rowGap: 10 }}>
        {fields.map(({ label, value, icon }) => (
          <div
            key={label}
            style={{
              display: "grid",
              gridTemplateColumns: "20px minmax(100px, 130px) 1fr",
              alignItems: "start",
              gap: 10,
            }}
          >
            <span style={{ color: LABEL_COL, display: "flex", alignItems: "center", paddingTop: 2 }}>
              {icon ?? <span style={{ width: 16 }} />}
            </span>
            <span style={{ fontSize: 13, color: LABEL_COL, fontWeight: 500, paddingTop: 2 }}>
              {label}
            </span>
            <span style={{ fontSize: 14, color: NAVY, fontWeight: 500, wordBreak: "break-word", lineHeight: 1.45 }}>
              {value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function EmptySectionNote({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ padding: "0 28px 18px" }}>
      <div
        style={{
          padding: "12px 14px",
          backgroundColor: "#F8FAFC",
          border: `1px solid ${BORDER}`,
          borderRadius: 8,
          fontSize: 13,
          color: LABEL_COL,
          lineHeight: 1.5,
        }}
      >
        {children}
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<StaffProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadProfile() {
      const supabase = getSupabaseBrowserClient();
      if (!supabase) {
        setError("Supabase is not configured.");
        setLoading(false);
        return;
      }

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user?.email) {
        router.replace("/login");
        return;
      }

      const email = user.email.trim();
      const meta = user.user_metadata as { full_name?: string } | undefined;

      const staffId = await getStaffIdForAuthUser(supabase, user);

      if (staffId == null) {
        setProfile(mergeProfile({ email, metaFullName: meta?.full_name }, {}, null));
        setLoading(false);
        return;
      }

      try {
        const [credRes, nameRes, staffRes] = await Promise.all([
          supabase
            .from("Staff Credentials")
            .select("username, STAFFstaff_id")
            .eq("STAFFstaff_id", staffId)
            .maybeSingle(),
          supabase
            .from("Staff Name")
            .select("prefix, given_name, preferred_name, family_name")
            .eq("STAFFstaff_id", staffId)
            .maybeSingle(),
          supabase
            .from("Staff")
            .select("staff_id, email, role, department, hpi_practitioner, is_active, auth_user_id")
            .eq("staff_id", staffId)
            .maybeSingle(),
        ]);

        if (credRes.error || nameRes.error) {
          console.error(credRes.error ?? nameRes.error);
        }
        if (staffRes.error) {
          console.error(staffRes.error);
        }

        const cred = credRes.data as { username?: string } | null;
        const name = nameRes.data as {
          prefix?: string;
          given_name?: string;
          preferred_name?: string;
          family_name?: string;
        } | null;

        const staff = staffRes.data as {
          email?: string | null;
          role?: string | null;
          department?: string | null;
          hpi_practitioner?: string | null;
        } | null;

        setProfile(
          mergeProfile(
            { email, metaFullName: meta?.full_name },
            {
              username: cred?.username,
              prefix: name?.prefix,
              givenName: name?.given_name,
              preferredName: name?.preferred_name,
              familyName: name?.family_name,
              directoryEmail: staff?.email?.trim() ?? "",
              hpiPractitioner: staff?.hpi_practitioner?.trim() ?? "",
              role: staff?.role?.trim() ?? "",
              department: staff?.department?.trim() ?? "",
            },
            staffId
          )
        );
      } catch (e) {
        console.error(e);
        setError("Could not load profile from the database.");
        setProfile(mergeProfile({ email, metaFullName: meta?.full_name }, {}, staffId));
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", backgroundColor: BG, display: "flex", flexDirection: "column" }}>
        <Header />
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: LABEL_COL, fontSize: 15 }}>
          Loading profile…
        </div>
      </div>
    );
  }

  if (!profile) return null;

  const identityFields: FieldRow[] = [];
  if (profile.signInEmail) {
    identityFields.push({ label: "Sign-in email", value: profile.signInEmail, icon: <IconMail /> });
  }
  if (profile.staffId != null) {
    identityFields.push({ label: "Staff ID", value: String(profile.staffId), icon: <IconHash /> });
  }
  if (profile.username) {
    identityFields.push({ label: "Username", value: profile.username, icon: <IconUser /> });
  }
  if (profile.prefix) {
    identityFields.push({ label: "Title", value: profile.prefix });
  }
  if (profile.givenName) {
    identityFields.push({ label: "Given name", value: profile.givenName });
  }
  if (profile.preferredName) {
    identityFields.push({ label: "Preferred name", value: profile.preferredName });
  }
  if (profile.familyName) {
    identityFields.push({ label: "Family name", value: profile.familyName });
  }
  if (profile.hpiPractitioner) {
    identityFields.push({ label: "HPI practitioner", value: profile.hpiPractitioner });
  }

  const contactFields: FieldRow[] = [];
  const dir = profile.directoryEmail.trim();
  const sign = profile.signInEmail.trim();
  if (dir && dir.toLowerCase() !== sign.toLowerCase()) {
    contactFields.push({ label: "Directory email", value: dir, icon: <IconMail /> });
  }

  const roleFields: FieldRow[] = [];
  if (profile.role) {
    roleFields.push({ label: "Role", value: profile.role, icon: <IconBriefcase /> });
  }
  if (profile.department) {
    roleFields.push({ label: "Department", value: profile.department });
  }

  const hasContact = contactFields.length > 0;
  const hasPosition = roleFields.length > 0;

  return (
    <div style={{ minHeight: "100vh", backgroundColor: BG, display: "flex", flexDirection: "column" }}>
      <Header />

      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "36px 20px 56px",
        }}
      >
        <div style={{ width: "100%", maxWidth: 560, marginBottom: 18 }}>
          <button
            type="button"
            onClick={() => router.push("/")}
            style={{
              background: "none",
              border: "none",
              color: BTN_PRIMARY,
              fontSize: 14,
              fontWeight: 500,
              padding: 0,
              cursor: "pointer",
              fontFamily: "inherit",
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
            Back to Dashboard
          </button>
        </div>

        <div
          style={{
            width: "100%",
            maxWidth: 560,
            backgroundColor: CARD_BG,
            border: `1px solid ${BORDER}`,
            borderRadius: 14,
            overflow: "hidden",
            boxShadow: "0 4px 24px rgba(21, 40, 76, 0.08)",
          }}
        >
          <div
            style={{
              background: `linear-gradient(145deg, ${BTN_PRIMARY} 0%, #1e3a5f 55%, #33476D 100%)`,
              padding: "44px 28px 0",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <div
              style={{
                width: 92,
                height: 92,
                borderRadius: "50%",
                background: "linear-gradient(145deg, #8B9DC8 0%, #5A6FA3 100%)",
                border: "4px solid #FFFFFF",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 32,
                fontWeight: 700,
                color: "#FFFFFF",
                letterSpacing: "0.06em",
                marginBottom: -46,
                position: "relative",
                zIndex: 1,
                boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
              }}
            >
              {profile.initials}
            </div>
          </div>

          <div style={{ paddingTop: 58, paddingBottom: 6, textAlign: "center", paddingLeft: 24, paddingRight: 24 }}>
            <h1 style={{ fontSize: 25, fontWeight: 700, margin: 0, color: NAVY, letterSpacing: "-0.02em" }}>
              {profile.fullName}
            </h1>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
              {profile.role && (
                <span
                  style={{
                    padding: "5px 14px",
                    borderRadius: 999,
                    backgroundColor: "#EEF2F7",
                    color: BTN_PRIMARY,
                    fontSize: 12,
                    fontWeight: 600,
                  }}
                >
                  {profile.role}
                </span>
              )}
              {profile.department && (
                <span
                  style={{
                    padding: "5px 14px",
                    borderRadius: 999,
                    backgroundColor: "#ECFDF5",
                    color: "#047857",
                    fontSize: 12,
                    fontWeight: 600,
                  }}
                >
                  {profile.department}
                </span>
              )}
            </div>
            {profile.username ? (
              <p style={{ fontSize: 13, color: LABEL_COL, margin: "10px 0 0 0" }}>
                @{profile.username}
              </p>
            ) : null}
          </div>

          {error && (
            <div
              role="alert"
              style={{
                margin: "12px 24px 0",
                padding: "10px 14px",
                backgroundColor: "#FFFBEB",
                border: "1px solid #FDE68A",
                borderRadius: 8,
                fontSize: 13,
                color: "#92400E",
              }}
            >
              {error}
            </div>
          )}

          <div style={{ height: 1, backgroundColor: BORDER, margin: "22px 0 0" }} />

          <ProfileSection title="Profile details" fields={identityFields} />

          {!hasContact && (
            <EmptySectionNote>
              <strong style={{ color: NAVY }}>Directory email</strong> matches your sign-in address, or no separate directory email is on file. The Staff table stores email, role, and department only (no phone field in this schema).
            </EmptySectionNote>
          )}
          {hasContact && (
            <>
              <div style={{ height: 1, backgroundColor: BORDER, margin: "0" }} />
              <ProfileSection title="Contact" fields={contactFields} />
            </>
          )}

          {!hasPosition && (
            <EmptySectionNote>
              <strong style={{ color: NAVY }}>Role &amp; department</strong> aren’t on file yet. They’ll appear here once set in the Staff directory.
            </EmptySectionNote>
          )}
          {hasPosition && (
            <>
              <div style={{ height: 1, backgroundColor: BORDER, margin: "0" }} />
              <ProfileSection title="Position" fields={roleFields} />
            </>
          )}

          <div style={{ height: 1, backgroundColor: BORDER, margin: "0" }} />

          <div style={{ padding: "22px 24px 26px", display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button
              type="button"
              onClick={() => router.push("/")}
              style={{
                flex: "1 1 140px",
                padding: "13px 18px",
                backgroundColor: BTN_PRIMARY,
                color: "#FFFFFF",
                border: "none",
                borderRadius: 8,
                fontSize: 14,
                fontWeight: 600,
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              Back to Dashboard
            </button>
            <button
              type="button"
              onClick={async () => {
                await signOutSupabase();
                router.push("/login");
              }}
              style={{
                flex: "1 1 140px",
                padding: "13px 18px",
                backgroundColor: "#FFFFFF",
                color: "#B91C1C",
                border: "1px solid #FECACA",
                borderRadius: 8,
                fontSize: 14,
                fontWeight: 600,
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              Sign out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
