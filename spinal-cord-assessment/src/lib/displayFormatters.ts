/** Shared display helpers used by history, landing tables, and drafts. */

export function formatDateNZ(dateString: string | null | undefined): string {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return dateString;
  return date.toLocaleDateString("en-NZ", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export type CompactAddressInput = {
  line1?: string | null;
  line2?: string | null;
  suburb?: string | null;
  city?: string | null;
  postal_code?: number | null;
  country?: string | null;
};

export function compactAddress(address: CompactAddressInput | null): string {
  if (!address) return "N/A";
  const parts = [
    address.line1,
    address.line2,
    address.suburb,
    address.city,
    address.postal_code,
    address.country,
  ].filter(Boolean);
  return parts.length ? parts.join(", ") : "N/A";
}

/** dd/mm/yyyy for recent assessments table */
export function formatDateShortDMY(dateString: string): string {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return dateString;
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

export function getAssessmentStatusColor(status: string): string {
  switch (status.toUpperCase()) {
    case "DRAFT":
      return "#C96A2B";
    case "FINALISED":
      return "#3E8E41";
    case "IN PROGRESS":
      return "#2F66C8";
    default:
      return "#15284C";
  }
}

/** True when both instants fall on the same local calendar day. */
export function sameLocalCalendarDay(a: Date, b: Date): boolean {
  const startA = new Date(a.getFullYear(), a.getMonth(), a.getDate());
  const startB = new Date(b.getFullYear(), b.getMonth(), b.getDate());
  return startA.getTime() === startB.getTime();
}

export function formatReviewDate(dateString: string): {
  formatted: string;
  isToday: boolean;
} {
  const reviewDate = new Date(dateString);
  const today = new Date();
  const isToday = sameLocalCalendarDay(reviewDate, today);
  if (isToday) return { formatted: "Today", isToday: true };
  const day = String(reviewDate.getDate()).padStart(2, "0");
  const month = String(reviewDate.getMonth() + 1).padStart(2, "0");
  const year = reviewDate.getFullYear();
  return { formatted: `${day}/${month}/${year}`, isToday: false };
}

export type DraftStatus = "OPEN" | "DRAFT" | "FINALIZED";

export function normalizeDraftStatus(status: string): DraftStatus {
  const upper = status.toUpperCase();
  if (upper === "OPEN") return "OPEN";
  if (upper === "FINALIZED" || upper === "FINALISED") return "FINALIZED";
  return "DRAFT";
}

export function labelDraftStatus(status: DraftStatus): string {
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

export function formatDraftDateIso(iso: string): string {
  return new Intl.DateTimeFormat("en-NZ").format(new Date(iso));
}
