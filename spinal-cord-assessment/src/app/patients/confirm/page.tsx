"use client";

import { Suspense } from "react";
import ConfirmPatientContent from "./ConfirmPatientContent";

export default function ConfirmPatientPage() {
  return (
    <Suspense fallback={<div>Loading confirmation...</div>}>
      <ConfirmPatientContent />
    </Suspense>
  );
}