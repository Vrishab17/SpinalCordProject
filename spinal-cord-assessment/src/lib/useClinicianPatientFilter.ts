"use client";

import { useEffect, useMemo, useState } from "react";
import type { ClinicianPatientFilter } from "@/lib/clinicianPatientFilter";
import { readStaffIdFromStorage } from "@/lib/staffSession";

/** Default: signed-in clinician only; toggle on for all assessments. */
export function useClinicianPatientFilter() {
  const [showAllAssessments, setShowAllAssessments] = useState(false);
  const [staffId, setStaffId] = useState<number | null>(null);

  useEffect(() => {
    setStaffId(readStaffIdFromStorage());
  }, []);

  const clinicianFilter: ClinicianPatientFilter = useMemo(() => {
    if (showAllAssessments) return { status: "all" };
    if (staffId == null) return { status: "loading" };
    return { status: "mine", staffId };
  }, [showAllAssessments, staffId]);

  return {
    showAllAssessments,
    setShowAllAssessments,
    clinicianFilter,
  };
}
