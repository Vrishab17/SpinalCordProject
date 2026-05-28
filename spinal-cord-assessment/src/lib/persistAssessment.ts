import type { UiExam } from "@/components/assessment/AssessmentForm";
import type { AssessmentId } from "./assessmentId";

export type PersistMode = "draft" | "final";

export type PersistAssessmentResult = {
  assessmentId: AssessmentId;
  createdAt: string | null;
  updatedAt: string;
  versionNumber: number;
};

/** Persists assessment via server API (service role + session cookie). */
export async function persistAssessmentToDatabase(opts: {
  patientId: number;
  mode: PersistMode;
  existingAssessmentId: AssessmentId | null;
  exam: UiExam;
  comments: string;
  injuryDate?: string | null;
  reviewDate?: string | null;
  classificationResult?: unknown;
}): Promise<PersistAssessmentResult> {
  const res = await fetch("/api/assessments/save", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(opts),
  });

  const body = (await res.json()) as PersistAssessmentResult & { error?: string };
  if (!res.ok) {
    throw new Error(body.error ?? "Could not save assessment.");
  }

  return body;
}

/** @deprecated Use `classificationResult` on `persistAssessmentToDatabase` instead. */
export async function persistClassificationAndTotals(opts: {
  assessmentId: AssessmentId;
  result: unknown;
  patientId: number;
  mode: PersistMode;
  existingAssessmentId: AssessmentId | null;
  exam: UiExam;
  comments: string;
  injuryDate?: string | null;
  reviewDate?: string | null;
}): Promise<PersistAssessmentResult> {
  return persistAssessmentToDatabase({
    ...opts,
    classificationResult: opts.result,
  });
}
