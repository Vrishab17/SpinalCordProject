"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getLoggedInStaff, logoutStaff } from "@/lib/auth";

export default function AuthGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const staff = getLoggedInStaff();

    if (!staff) {
      logoutStaff();
      router.replace("/login");
      return;
    }

    setChecked(true);
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