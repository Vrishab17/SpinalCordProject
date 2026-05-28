"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Header from "@/components/layout/Header";
import AssessmentForm, {
  type UiExam,
} from "@/components/assessment/AssessmentForm";
import PatientAssessmentBar from "@/components/assessment/PatientAssessmentBar";
import {
  assessmentIdParamLoadError,
  parseAssessmentIdParam,
} from "@/lib/assessmentId";
import AuthGuard from "@/components/AuthGuard";

type AssessmentContextResponse = {
  patientId: number | null;
  resolvedNhi: string | null;
  displayAssessmentId?: string | null;
  initialExam: UiExam | null;
  initialComments: string;
  initialInjuryDate: string;
  initialReviewDate: string;
  initialCreatedAt: string | null;
  initialUpdatedAt: string | null;
  readOnly: boolean;
  bar: {
    name: string;
    dob: string;
    age: string;
    gender: string;
    ethnicity: string;
    nhi: string;
    address: string;
  };
  error?: string;
};

async function loadAssessmentContextFromApi(params: {
  assessmentId?: string | null;
  nhi?: string | null;
}): Promise<AssessmentContextResponse> {
  const query = new URLSearchParams();
  if (params.assessmentId) query.set("assessmentId", params.assessmentId);
  if (params.nhi) query.set("nhi", params.nhi);
  const res = await fetch(`/api/assessment/context?${query.toString()}`, {
    credentials: "include",
  });
  const body = (await res.json()) as AssessmentContextResponse;
  if (!res.ok) {
    throw new Error(body.error || "Failed to load assessment.");
  }
  return body;
}

function AssessmentNewInner() {
  const searchParams = useSearchParams();
  const nhiParam = searchParams.get("nhi");
  const assessmentIdParam = searchParams.get("assessmentId");
  const assessmentIdParamError = assessmentIdParamLoadError(assessmentIdParam);
  const assessmentId = parseAssessmentIdParam(assessmentIdParam);

  const [fetching, setFetching] = useState(
    Boolean(nhiParam) || assessmentId != null
  );
  const [loadError, setLoadError] = useState<string | null>(
    assessmentIdParamError
  );
  const [displayAssessmentId, setDisplayAssessmentId] = useState<string | null>(
    assessmentId
  );
  const [patientId, setPatientId] = useState<number | null>(null);
  const [resolvedNhi, setResolvedNhi] = useState<string | null>(nhiParam);
  const [initialExam, setInitialExam] = useState<UiExam | null>(null);
  const [initialComments, setInitialComments] = useState("");
  const [initialInjuryDate, setInitialInjuryDate] = useState("");
  const [initialReviewDate, setInitialReviewDate] = useState("");
  const [initialCreatedAt, setInitialCreatedAt] = useState<string | null>(null);
  const [initialUpdatedAt, setInitialUpdatedAt] = useState<string | null>(null);
  const [readOnly, setReadOnly] = useState(false);
  const [bar, setBar] = useState({
    name: "",
    dob: "",
    age: "",
    gender: "",
    ethnicity: "",
    nhi: "",
    address: "",
  });

  useEffect(() => {
    setDisplayAssessmentId(assessmentId);
  }, [assessmentId]);

  useEffect(() => {
    if (assessmentIdParamError) {
      setLoadError(assessmentIdParamError);
      setDisplayAssessmentId(null);
      setFetching(false);
      return;
    }
  }, [assessmentIdParamError]);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      if (assessmentIdParamError) {
        return;
      }

      if (!nhiParam && assessmentId == null) {
        setPatientId(null);
        setResolvedNhi(null);
        setInitialExam(null);
        setInitialComments("");
        setInitialInjuryDate("");
        setInitialReviewDate("");
        setInitialCreatedAt(null);
        setInitialUpdatedAt(null);
        setReadOnly(false);
        setLoadError(null);
        setFetching(false);
        return;
      }

      setFetching(true);
      setLoadError(null);

      try {
        if (assessmentId != null) {
          const ctx = await loadAssessmentContextFromApi({ assessmentId });
          if (cancelled) return;

          setPatientId(ctx.patientId);
          setResolvedNhi(ctx.resolvedNhi);
          setDisplayAssessmentId(ctx.displayAssessmentId ?? assessmentId);
          setInitialExam(ctx.initialExam);
          setInitialComments(ctx.initialComments);
          setInitialInjuryDate(ctx.initialInjuryDate);
          setInitialReviewDate(ctx.initialReviewDate);
          setInitialCreatedAt(ctx.initialCreatedAt);
          setInitialUpdatedAt(ctx.initialUpdatedAt);
          setReadOnly(ctx.readOnly);
          setBar(ctx.bar);
          setFetching(false);
          return;
        }

        if (nhiParam) {
          const loaded = await loadAssessmentContextFromApi({ nhi: nhiParam });
          if (cancelled) return;

          setPatientId(loaded.patientId);
          setResolvedNhi(loaded.resolvedNhi);
          setInitialExam(loaded.initialExam);
          setInitialComments(loaded.initialComments);
          setInitialInjuryDate(loaded.initialInjuryDate);
          setInitialReviewDate(loaded.initialReviewDate);
          setInitialCreatedAt(null);
          setInitialUpdatedAt(null);
          setReadOnly(false);
          setBar(loaded.bar);
          setFetching(false);
        }
      } catch (e) {
        if (cancelled) return;
        setLoadError(e instanceof Error ? e.message : "Failed to load assessment.");
        setFetching(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [nhiParam, assessmentId, assessmentIdParamError]);

  return (
    <AuthGuard>
      <div
        className="assessment-page"
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          backgroundColor: "#F6F4EC",
        }}
      >
        <Header />
        <PatientAssessmentBar
          assessmentId={displayAssessmentId}
          name={bar.name}
          dob={bar.dob}
          age={bar.age}
          gender={bar.gender}
          ethnicity={bar.ethnicity}
          nhi={bar.nhi}
          address={bar.address}
          loading={fetching}
        />
        {loadError ? (
          <div
            style={{
              padding: "32px 24px",
              color: "#33476D",
              fontSize: "16px",
              textAlign: "center",
              lineHeight: 1.5,
            }}
          >
            {loadError}
          </div>
        ) : (
          <div
            style={{
              flex: 1,
              minHeight: 0,
              display: "flex",
              flexDirection: "column",
            }}
          >
            <AssessmentForm
              patientId={patientId}
              patientNhi={resolvedNhi}
              initialAssessmentId={assessmentId}
              initialExam={initialExam}
              initialComments={initialComments}
              initialInjuryDate={initialInjuryDate}
              initialReviewDate={initialReviewDate}
              initialCreatedAt={initialCreatedAt}
              initialUpdatedAt={initialUpdatedAt}
              readOnly={readOnly}
              onAssessmentIdChange={setDisplayAssessmentId}
            />
          </div>
        )}
      </div>
    </AuthGuard>
  );
}

export default function AssessmentNewClient() {
  return (
    <Suspense
      fallback={
        <AuthGuard>
          <div style={{ minHeight: "100vh", backgroundColor: "#F6F4EC" }}>
            <Header />
            <PatientAssessmentBar
              assessmentId={null}
              name="—"
              dob="—"
              age="—"
              gender="—"
              ethnicity="—"
              nhi="—"
              address="—"
              loading
            />
          </div>
        </AuthGuard>
      }
    >
      <AssessmentNewInner />
    </Suspense>
  );
}
