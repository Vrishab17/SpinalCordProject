import { getLoggedInStaff } from "./auth";

/** True when a staff session exists in sessionStorage. */
export function hasValidStaffSession(): boolean {
  return getLoggedInStaff() != null;
}

/** Client-side staff id from login (`staffInfo` in sessionStorage). */
export function readStaffIdFromStorage(): number | null {
  return getLoggedInStaff()?.staffId ?? null;
}
