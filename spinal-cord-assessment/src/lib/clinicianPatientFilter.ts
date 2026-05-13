/** Dashboard filter: patients linked via Assessment.STAFFstaff_id → PATIENTpatient_id. */
export type ClinicianPatientFilter =
  | { status: "all" }
  | { status: "loading" }
  | { status: "ready"; patientIds: ReadonlySet<number> };

export const DEFAULT_CLINICIAN_PATIENT_FILTER: ClinicianPatientFilter = { status: "all" };
