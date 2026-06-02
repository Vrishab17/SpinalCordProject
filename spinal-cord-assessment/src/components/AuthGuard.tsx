"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getLoggedInStaff, logoutStaff, type StaffInfo } from "@/lib/auth";

export default function AuthGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function verify() {
      const local = getLoggedInStaff();
      if (local) {
        if (!cancelled) setChecked(true);
        return;
      }

      try {
        const res = await fetch("/api/auth/session", {
          credentials: "include",
        });
        if (res.ok) {
          const staff = (await res.json()) as StaffInfo;
          sessionStorage.setItem("staffInfo", JSON.stringify(staff));
          if (!cancelled) setChecked(true);
          return;
        }
      } catch {
        // fall through to logout
      }

      await logoutStaff();
      router.replace("/login");
    }

    void verify();
    return () => {
      cancelled = true;
    };
  }, [router]);

  if (!checked) {
    return (
      <div
        style={{
          backgroundColor: "#F6F4EC",
          minHeight: "100vh",
        }}
      />
    );
  }

  return <>{children}</>;
}
