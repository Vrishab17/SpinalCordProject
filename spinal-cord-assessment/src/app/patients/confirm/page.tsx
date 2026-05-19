"use client";

import { Suspense } from "react";
import ConfirmPatientContent from "./ConfirmPatientContent";
import AuthGuard from "@/components/AuthGuard";

export default function ConfirmPatientPage() {
  return (
    <AuthGuard>
      <Suspense fallback={<div>Loading confirmation...</div>}>
        <ConfirmPatientContent />
      </Suspense>
    </AuthGuard>
  );
}
