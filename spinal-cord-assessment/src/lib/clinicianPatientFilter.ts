/** Dashboard filter: assessments assigned to the logged-in clinician vs all. */
export type ClinicianPatientFilter =
  | { status: "all" }
  | { status: "loading" }
  | { status: "mine"; staffId: number };

export const DEFAULT_CLINICIAN_PATIENT_FILTER: ClinicianPatientFilter = {
  status: "loading",
};
