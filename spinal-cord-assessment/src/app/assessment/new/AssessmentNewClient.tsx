"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Header from "@/components/layout/Header";
import AssessmentForm from "@/components/assessment/AssessmentForm";
import PatientAssessmentBar from "@/components/assessment/PatientAssessmentBar";
import { supabase } from "@/lib/supabaseClient";

function formatNZDate(ds: string | null | undefined): string {
  if (!ds) return "";
  const d = new Date(ds);
  if (Number.isNaN(d.getTime())) return ds;
  return d.toLocaleDateString("en-NZ", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function ageFromDob(dob: string | null | undefined): string {
  if (!dob) return "";
  const birth = new Date(dob);
  if (Number.isNaN(birth.getTime())) return "";
  const today = new Date();
  let y = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) y--;
  return `${y} Years`;
}

function AssessmentNewInner() {
  const searchParams = useSearchParams();
  const nhi = searchParams.get("nhi");

  const [fetchingPatient, setFetchingPatient] = useState(Boolean(nhi));
  const [patientId, setPatientId] = useState<number | null>(null);
  const [bar, setBar] = useState({
    name: "",
    dob: "",
    age: "",
    gender: "",
    ethnicity: "",
    address: "",
  });

  useEffect(() => {
    if (!nhi) setPatientId(null);
  }, [nhi]);

  useEffect(() => {
    if (!nhi) return;

    let cancelled = false;
    (async () => {
      setFetchingPatient(true);
      const { data: patient, error } = await supabase
        .from("Patient")
        .select(
          "patient_id,nhi_number,date_of_birth,gender,ethnicity,place_of_birth"
        )
        .eq("nhi_number", nhi)
        .maybeSingle();

      if (cancelled) return;

      if (error || !patient) {
        setPatientId(null);
        setBar({
          name: "",
          dob: "",
          age: "",
          gender: "",
          ethnicity: "",
          address: "",
        });
        setFetchingPatient(false);
        return;
      }

      const pid = patient.patient_id as number;
      setPatientId(pid);

      const [nameRes, addrRes] = await Promise.all([
        supabase
          .from("Patient Name")
          .select("given_name,family_name")
          .eq("PATIENTpatient_id", pid)
          .limit(1)
          .maybeSingle(),
        supabase
          .from("Patient Address")
          .select("line1,line2,suburb,city,postal_code,country")
          .eq("PATIENTpatient_id", pid)
          .limit(1)
          .maybeSingle(),
      ]);

      if (cancelled) return;

      const nm = nameRes.data as {
        given_name?: string | null;
        family_name?: string | null;
      } | null;
      const fullName =
        nm && (nm.family_name || nm.given_name)
          ? `${nm.family_name ?? ""}${nm.family_name && nm.given_name ? ", " : ""}${nm.given_name ?? ""}`.trim()
          : "";

      const ad = addrRes.data as Record<string, unknown> | null;
      const addrParts = ad
        ? [
            ad.line1,
            ad.line2,
            ad.suburb,
            ad.city,
            ad.postal_code != null ? String(ad.postal_code) : null,
            ad.country,
          ].filter((x): x is string => typeof x === "string" && x.trim() !== "")
        : [];

      setBar({
        name: fullName,
        dob: formatNZDate(patient.date_of_birth as string | null),
        age: ageFromDob(patient.date_of_birth as string | null),
        gender: String(patient.gender ?? ""),
        ethnicity: String(patient.ethnicity ?? ""),
        address: addrParts.length > 0 ? addrParts.join(", ") : "",
      });
      setFetchingPatient(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [nhi]);

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#F6F4EC",
      }}
    >
      <Header />
      <PatientAssessmentBar
        name={bar.name}
        dob={bar.dob}
        age={bar.age}
        gender={bar.gender}
        ethnicity={bar.ethnicity}
        address={bar.address}
        loading={Boolean(nhi) && fetchingPatient}
      />
      <div style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}>
        <AssessmentForm patientId={patientId} />
      </div>
    </div>
  );
}

export default function AssessmentNewClient() {
  return (
    <Suspense
      fallback={
        <div style={{ minHeight: "100vh", backgroundColor: "#F6F4EC" }}>
          <Header />
          <PatientAssessmentBar
            name="—"
            dob="—"
            age="—"
            gender="—"
            ethnicity="—"
            address="—"
            loading
          />
        </div>
      }
    >
      <AssessmentNewInner />
    </Suspense>
  );
}
