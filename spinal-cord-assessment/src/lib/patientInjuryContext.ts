export type PatientInjuryContext = {
  dateOfInjury: string;
  injuryCause: string;
  notes: string;
};

const STORAGE_PREFIX = "patient_injury_";

export function savePatientInjuryContext(
  nhi: string,
  ctx: PatientInjuryContext
): void {
  if (typeof sessionStorage === "undefined") return;
  const normalized = nhi.trim().toUpperCase();
  if (!normalized) return;
  sessionStorage.setItem(
    `${STORAGE_PREFIX}${normalized}`,
    JSON.stringify(ctx)
  );
}

export function readPatientInjuryContext(
  nhi: string
): PatientInjuryContext | null {
  if (typeof sessionStorage === "undefined") return null;
  const normalized = nhi.trim().toUpperCase();
  if (!normalized) return null;
  const raw = sessionStorage.getItem(`${STORAGE_PREFIX}${normalized}`);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as PatientInjuryContext;
  } catch {
    return null;
  }
}

export function clearPatientInjuryContext(nhi: string): void {
  if (typeof sessionStorage === "undefined") return;
  const normalized = nhi.trim().toUpperCase();
  if (!normalized) return;
  sessionStorage.removeItem(`${STORAGE_PREFIX}${normalized}`);
}

/** Builds draft notes from injury registration fields. */
export function formatInjuryNotes(ctx: PatientInjuryContext): string | null {
  const parts: string[] = [];
  if (ctx.injuryCause?.trim()) {
    parts.push(`Injury cause: ${ctx.injuryCause.trim()}`);
  }
  if (ctx.notes?.trim()) {
    parts.push(ctx.notes.trim());
  }
  return parts.length > 0 ? parts.join("\n\n") : null;
}
