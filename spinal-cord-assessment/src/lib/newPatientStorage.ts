import type { NewPatientFormData } from "@/components/patients/NewPatientForm";

export const NEW_PATIENT_STORAGE_KEY = "new_patient_form_data";

export function readNewPatientFormData(): NewPatientFormData | null {
  if (typeof sessionStorage === "undefined") return null;
  const raw = sessionStorage.getItem(NEW_PATIENT_STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as NewPatientFormData;
  } catch {
    return null;
  }
}

export function writeNewPatientFormData(data: NewPatientFormData): void {
  if (typeof sessionStorage === "undefined") return;
  sessionStorage.setItem(NEW_PATIENT_STORAGE_KEY, JSON.stringify(data));
}

export function clearNewPatientFormData(): void {
  if (typeof sessionStorage === "undefined") return;
  sessionStorage.removeItem(NEW_PATIENT_STORAGE_KEY);
}
