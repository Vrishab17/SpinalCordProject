"use client";

import { useEffect, useState } from "react";
import Header from "@/components/layout/Header";
import Buttons from "@/components/landing/buttons";
import RecentAssessments from "@/components/landing/recentAssessments";
import UpcomingReviews from "@/components/landing/upcoming";
import { supabase } from "@/lib/supabaseClient";
import type { ClinicianPatientFilter } from "@/lib/clinicianPatientFilter";

function readStaffIdFromStorage(): number | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem("staffInfo");
    if (!raw) return null;
    const j = JSON.parse(raw) as { staffId?: unknown };
    const id = j.staffId;
    return typeof id === "number" && Number.isFinite(id) ? id : null;
  } catch {
    return null;
  }
}

export default function DashboardClient() {
  const [onlyMyPatients, setOnlyMyPatients] = useState(false);
  const [clinicianFilter, setClinicianFilter] = useState<ClinicianPatientFilter>({
    status: "all",
  });
  const [staffId, setStaffId] = useState<number | null>(null);

  useEffect(() => {
    setStaffId(readStaffIdFromStorage());
  }, []);

  useEffect(() => {
    if (!onlyMyPatients) {
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
  }, [onlyMyPatients, staffId]);

  return (
    <main
      style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#F6F4EC",
      }}
    >
      <Header />

      <div
        style={{
          flex: 1,
          overflow: "hidden",
          maxWidth: "1300px",
          width: "100%",
          margin: "0 auto",
          padding: "32px 24px",
          display: "flex",
          flexDirection: "column",
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "20px",
            flexShrink: 0,
            flexWrap: "wrap",
            gap: "12px",
          }}
        >
          <h1
            style={{
              fontSize: "40px",
              fontWeight: 700,
              margin: 0,
              color: "#15284C",
            }}
          >
            ISNCSCI / ASRU
          </h1>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "20px",
              flexWrap: "wrap",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
              }}
            >
              <button
                type="button"
                role="switch"
                aria-checked={onlyMyPatients}
                aria-label="Show only patients assigned to me"
                onClick={() => setOnlyMyPatients((v) => !v)}
                style={{
                  position: "relative",
                  width: "44px",
                  height: "24px",
                  borderRadius: "12px",
                  border: "none",
                  cursor: "pointer",
                  padding: 0,
                  flexShrink: 0,
                  backgroundColor: onlyMyPatients ? "#15284C" : "#D1D5DB",
                  transition: "background-color 0.15s ease",
                }}
              >
                <span
                  style={{
                    position: "absolute",
                    top: "3px",
                    left: onlyMyPatients ? "23px" : "3px",
                    width: "18px",
                    height: "18px",
                    borderRadius: "50%",
                    backgroundColor: "#FFFFFF",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                    transition: "left 0.15s ease",
                  }}
                />
              </button>
              <span
                style={{
                  fontSize: "14px",
                  color: "#15284C",
                  fontWeight: 500,
                  userSelect: "none",
                }}
              >
                My Assessments 
              </span>
            </div>

            <Buttons />
          </div>
        </div>

        <div
          style={{
            flex: 1,
            display: "grid",
            gridTemplateColumns: "2fr 1fr",
            gap: "20px",
            overflow: "hidden",
            minHeight: 0,
          }}
        >
          <div
            style={{
              height: "100%",
              minHeight: 0,
              overflow: "hidden",
            }}
          >
            <RecentAssessments clinicianPatientFilter={clinicianFilter} />
          </div>

          <div
            style={{
              height: "100%",
              minHeight: 0,
              overflow: "hidden",
            }}
          >
            <UpcomingReviews clinicianPatientFilter={clinicianFilter} />
          </div>
        </div>
      </div>
    </main>
  );
}
