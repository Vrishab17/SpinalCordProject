/** Normalises date or datetime strings to `YYYY-MM-DD` for Postgres `date` columns. */
export function toDateOnly(value: string | null | undefined): string | null {
  if (value == null) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (/^\d{4}-\d{2}-\d{2}/.test(trimmed)) return trimmed.slice(0, 10);
  const parsed = new Date(trimmed);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.toISOString().slice(0, 10);
}

export function formatAssessmentDateDisplay(
  value: string | null | undefined
): string {
  if (!value) return "";
  const dateOnly = toDateOnly(value);
  if (!dateOnly) return "";
  const d = new Date(`${dateOnly}T12:00:00`);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString("en-NZ", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function formatAssessmentTimestampDisplay(
  value: string | null | undefined
): string {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString("en-NZ", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function defaultReviewDateFromInjury(
  injuryDate: string | null | undefined
): string | null {
  const injury = toDateOnly(injuryDate);
  if (!injury) return null;
  const d = new Date(`${injury}T12:00:00`);
  if (Number.isNaN(d.getTime())) return null;
  d.setDate(d.getDate() + 90);
  return d.toISOString().slice(0, 10);
}
