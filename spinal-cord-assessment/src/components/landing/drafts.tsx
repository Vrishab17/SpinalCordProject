"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export type DraftStatus = "OPEN" | "DRAFT" | "FINALIZED";

export type DraftAssessment = {
  id: string;
  assessmentId: number;
  patientId: number;
  nhi: string;
  patientName: string;
  dateLastEditedISO: string;
  versionNumber: number;
  status: DraftStatus;
};

type DraftAssessmentRow = {
  draft_id: number;
  ASSESSMENTassessment_id: number;
  last_saved_at: string | null;
  is_current_draft: string | null;
};

type AssessmentRow = {
  assessment_id: number;
  PATIENTpatient_id: number;
  current_version: number;
  status: string;
};

type PatientRow = {
  patient_id: number;
  nhi_number: string;
};

type PatientNameRow = {
  PATIENTpatient_id: number;
  given_name: string;
  family_name: string;
};

function relativeTime(iso: string): string {
  const now = Date.now();
  const then = new Date(iso).getTime();
  const diffMs = now - then;

  if (diffMs < 0) return "just now";

  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;

  return new Intl.DateTimeFormat("en-NZ").format(new Date(iso));
}

function normalizeStatus(status: string): DraftStatus {
  const upper = status.toUpperCase();
  if (upper === "OPEN") return "OPEN";
  if (upper === "FINALIZED" || upper === "FINALISED") return "FINALIZED";
  return "DRAFT";
}

function labelStatus(status: DraftStatus) {
  switch (status) {
    case "OPEN":
      return "Open";
    case "FINALIZED":
      return "Finalized";
    case "DRAFT":
    default:
      return "Draft";
  }
}

export default function Drafts() {
  const router = useRouter();

  const [drafts, setDrafts] = useState<DraftAssessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDrafts() {
      setLoading(true);
      setError(null);

      const { data: draftData, error: draftError } = await supabase
        .from("Draft Assessment")
        .select("draft_id, ASSESSMENTassessment_id, last_saved_at, is_current_draft")
        .eq("is_current_draft", "true");

      if (draftError) {
        setError(`Draft query failed: ${draftError.message}`);
        setLoading(false);
        return;
      }

      const draftRows = (draftData ?? []) as DraftAssessmentRow[];

      if (draftRows.length === 0) {
        setDrafts([]);
        setLoading(false);
        return;
      }

      const assessmentIds = [...new Set(draftRows.map((draft) => draft.ASSESSMENTassessment_id))];

      const { data: assessmentData, error: assessmentError } = await supabase
        .from("Assessment")
        .select("assessment_id, PATIENTpatient_id, current_version, status")
        .in("assessment_id", assessmentIds);

      if (assessmentError) {
        setError(`Assessment query failed: ${assessmentError.message}`);
        setLoading(false);
        return;
      }

      const assessments = (assessmentData ?? []) as AssessmentRow[];

      const patientIds = [...new Set(assessments.map((assessment) => assessment.PATIENTpatient_id))];

      const { data: patientData } = await supabase
        .from("Patient")
        .select("patient_id, nhi_number")
        .in("patient_id", patientIds);

      const { data: patientNameData } = await supabase
        .from("Patient Name")
        .select("PATIENTpatient_id, given_name, family_name")
        .in("PATIENTpatient_id", patientIds);

      const patientMap = new Map<number, PatientRow>();
      (patientData ?? []).forEach((p: PatientRow) => {
        patientMap.set(p.patient_id, p);
      });

      const nameMap = new Map<number, PatientNameRow>();
      (patientNameData ?? []).forEach((n: PatientNameRow) => {
        nameMap.set(n.PATIENTpatient_id, n);
      });

      const mappedDrafts: DraftAssessment[] = draftRows
        .map((draft) => {
          const assessment = assessments.find(
            (a) => a.assessment_id === draft.ASSESSMENTassessment_id
          );

          if (!assessment) return null;

          const patient = patientMap.get(assessment.PATIENTpatient_id);
          const name = nameMap.get(assessment.PATIENTpatient_id);

          return {
            id: String(draft.draft_id),
            assessmentId: assessment.assessment_id,
            patientId: assessment.PATIENTpatient_id,
            nhi: patient?.nhi_number ?? "N/A",
            patientName: name
              ? `${name.given_name} ${name.family_name}`
              : `Patient #${assessment.PATIENTpatient_id}`,
            dateLastEditedISO: draft.last_saved_at ?? new Date().toISOString(),
            versionNumber: assessment.current_version ?? 1,
            status: normalizeStatus(assessment.status ?? "DRAFT"),
          };
        })
        .filter((draft): draft is DraftAssessment => draft !== null);

      setDrafts(mappedDrafts);
      setLoading(false);
    }

    fetchDrafts();
  }, []);

  const sortedDrafts = useMemo(() => {
    return [...drafts].sort(
      (a, b) => new Date(b.dateLastEditedISO).getTime() - new Date(a.dateLastEditedISO).getTime()
    );
  }, [drafts]);

  function handleRowKeyDown(e: React.KeyboardEvent, patientId: number) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      router.push(`/history/${patientId}`);
    }
  }

  function handleContinueClick(e: React.MouseEvent, assessmentId: number) {
    e.stopPropagation();
    router.push(`/assessment?assessmentId=${assessmentId}`);
  }

  const headerCellStyle: React.CSSProperties = {
    padding: "14px 12px",
    minHeight: "48px",
    textAlign: "left",
    fontWeight: 600,
    position: "sticky",
    top: 0,
    backgroundColor: "#FFFFFF",
    zIndex: 2,
    borderBottom: "1px solid #D6D6D6",
  };

  const bodyCellStyle: React.CSSProperties = {
    padding: "14px 12px",
    minHeight: "48px",
    verticalAlign: "middle",
    borderBottom: "1px solid #E5E7EB",
  };

  const colSpan = 5;

  return (
    <div
      className="dashboard-card"
      style={{
        backgroundColor: "#FFFFFF",
        border: "1px solid #D6D6D6",
        borderRadius: "8px",
        padding: "18px",
        width: "100%",
        color: "#15284C",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        minHeight: 0,
      }}
    >
      <h2
        style={{
          fontSize: "20px",
          fontWeight: 600,
          marginBottom: "14px",
          flexShrink: 0,
        }}
      >
        Pending Drafts
      </h2>

      <div
        style={{
          flex: 1,
          minHeight: 0,
          overflowY: "auto",
          overflowX: "auto",
        }}
      >
        <table
          style={{
            width: "100%",
            borderCollapse: "separate",
            borderSpacing: 0,
            fontSize: "14px",
          }}
        >
          <thead>
            <tr>
              <th scope="col" style={headerCellStyle}>NHI</th>
              <th scope="col" style={headerCellStyle}>Patient Name</th>
              <th scope="col" style={headerCellStyle}>Last Edited</th>
              <th scope="col" style={headerCellStyle}>Status</th>
              <th scope="col" style={{ ...headerCellStyle, textAlign: "right" }}>Action</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={colSpan} style={{ padding: "24px", textAlign: "center" }}>
                  Loading...
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={colSpan} style={{ padding: "24px", textAlign: "center", color: "red" }}>
                  {error}
                </td>
              </tr>
            ) : sortedDrafts.length === 0 ? (
              <tr>
                <td colSpan={colSpan} style={{ padding: "24px", textAlign: "center" }}>
                  No drafts yet
                </td>
              </tr>
            ) : (
              sortedDrafts.map((draft) => (
                <tr
                  key={draft.id}
                  className="clickable-row"
                  role="link"
                  tabIndex={0}
                  aria-label={`View patient ${draft.patientName}`}
                  onClick={() => router.push(`/history/${draft.patientId}`)}
                  onKeyDown={(e) => handleRowKeyDown(e, draft.patientId)}
                >
                  <td style={bodyCellStyle}>{draft.nhi}</td>
                  <td style={bodyCellStyle}>{draft.patientName}</td>
                  <td style={bodyCellStyle}>{relativeTime(draft.dateLastEditedISO)}</td>
                  <td style={bodyCellStyle}>{labelStatus(draft.status)}</td>
                  <td style={{ ...bodyCellStyle, textAlign: "right" }}>
                    <button
                      className="row-action-btn"
                      onClick={(e) => handleContinueClick(e, draft.assessmentId)}
                      aria-label={`Continue draft for ${draft.patientName}`}
                    >
                      Continue
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
