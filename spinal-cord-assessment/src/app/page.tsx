"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { hasValidStaffSession } from "@/lib/staffSession";
import LandingPage from "./landingPage/landingPage";

export default function Page() {
  const router = useRouter();
  const [authed, setAuthed] = useState<boolean | null>(null);

  useEffect(() => {
    if (!hasValidStaffSession()) {
      router.replace("/login");
      return;
    }
    setAuthed(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- session gate runs once on mount
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
