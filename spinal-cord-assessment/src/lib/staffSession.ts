/** Client-side staff id from login (`staffInfo` in localStorage). */
export function readStaffIdFromStorage(): number | null {
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
