/** Assessment primary key: two uppercase letters + two digits (e.g. `AB12`). */
export type AssessmentId = string;

export const ASSESSMENT_ID_PATTERN = /^[A-Z]{2}[0-9]{2}$/;

const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

export function isAssessmentId(value: unknown): value is AssessmentId {
  return typeof value === "string" && ASSESSMENT_ID_PATTERN.test(value);
}

export function parseAssessmentIdParam(
  param: string | null | undefined
): AssessmentId | null {
  if (!param) return null;
  const normalized = param.trim().toUpperCase();
  return isAssessmentId(normalized) ? normalized : null;
}

export const ASSESSMENT_NOT_FOUND_MESSAGE =
  "Assessment not found — open from dashboard or history.";

/** Non-null when the URL has an assessmentId that is missing or not LLNN. */
export function assessmentIdParamLoadError(
  param: string | null | undefined
): string | null {
  if (!param?.trim()) return null;
  if (!parseAssessmentIdParam(param)) {
    return ASSESSMENT_NOT_FOUND_MESSAGE;
  }
  return null;
}

export function generateRandomLlnnAssessmentId(): AssessmentId {
  const l1 = LETTERS[Math.floor(Math.random() * 26)]!;
  const l2 = LETTERS[Math.floor(Math.random() * 26)]!;
  const d1 = Math.floor(Math.random() * 10);
  const d2 = Math.floor(Math.random() * 10);
  return `${l1}${l2}${d1}${d2}`;
}
