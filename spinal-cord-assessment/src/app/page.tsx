"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { hasValidStaffSession } from "@/lib/staffSession";
import LandingPage from "./landingPage/landingPage";

export default function Page() {
  const router = useRouter();
  const [authed, setAuthed] = useState<boolean | null>(null);

  // Run once on mount only. Including `router` in deps can re-fire the effect when the
  // router object identity changes, causing repeated replace() → infinite refresh in dev.
  useEffect(() => {
    if (!hasValidStaffSession()) {
      router.replace("/login");
      return;
    }
    setAuthed(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional: session gate runs once
  }, []);

  if (authed !== true) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#F6F4EC",
          color: "#15284C",
          fontSize: 14,
        }}
      >
        Loading…
      </div>
    );
  }

  return <LandingPage />;
}
