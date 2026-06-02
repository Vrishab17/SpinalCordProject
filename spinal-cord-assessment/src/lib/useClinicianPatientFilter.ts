"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { readStaffIdFromStorage } from "@/lib/staffSession";
import type { ClinicianPatientFilter } from "@/lib/clinicianPatientFilter";

/** Default: signed-in clinician's patients only; toggle on for all patients. */
export function useClinicianPatientFilter() {
  const [showAllAssessments, setShowAllAssessments] = useState(false);
  const [clinicianFilter, setClinicianFilter] =
    useState<ClinicianPatientFilter>({ status: "loading" });
  const [staffId, setStaffId] = useState<number | null>(null);

  useEffect(() => {
    setStaffId(readStaffIdFromStorage());
  }, []);

  useEffect(() => {
    if (showAllAssessments) {
      setClinicianFilter({ status: "all" });
      return;
    }

    const sid = staffId ?? readStaffIdFromStorage();
    if (sid == null) {
      setClinicianFilter({ status: "ready", patientIds: new Set() });
      return;
    }

    setClinicianFilter({ status: "loading" });
    let cancelled = false;

    (async () => {
      const { data, error } = await supabase
        .from("Assessment")
        .select("PATIENTpatient_id")
        .eq("STAFFstaff_id", sid);

      if (cancelled) return;

      if (error) {
        setClinicianFilter({ status: "ready", patientIds: new Set() });
        return;
      }

      const ids = new Set<number>();
      for (const row of data ?? []) {
        const id = (row as { PATIENTpatient_id: number }).PATIENTpatient_id;
        if (typeof id === "number") ids.add(id);
      }
      setClinicianFilter({ status: "ready", patientIds: ids });
    })();

    return () => {
      cancelled = true;
    };
  }, [showAllAssessments, staffId]);

  return {
    showAllAssessments,
    setShowAllAssessments,
    clinicianFilter,
  };
}
