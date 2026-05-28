import { defaultReviewDateFromInjury, toDateOnly } from "@/lib/assessmentDates";
import { supabase } from "@/lib/supabaseClient";

export type PatientInjuryDates = {
  injuryDate: string;
  reviewDate: string;
};

export async function loadPatientInjuryDates(
  patientId: number
): Promise<PatientInjuryDates> {
  const { data, error } = await supabase
    .from("Patient Injury")
    .select("injury_date, review_date")
    .eq("PATIENTpatient_id", patientId)
    .maybeSingle();

  if (error) throw new Error(error.message);

  const injuryDate = toDateOnly(data?.injury_date as string | null) ?? "";
  const reviewDate =
    toDateOnly(data?.review_date as string | null) ??
    defaultReviewDateFromInjury(injuryDate) ??
    "";

  return { injuryDate, reviewDate };
}
