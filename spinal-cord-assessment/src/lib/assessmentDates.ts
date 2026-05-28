import { defaultReviewDateFromInjury, toDateOnly } from "./assessmentDatesCore";

export {
  toDateOnly,
  formatAssessmentDateDisplay,
  formatAssessmentTimestampDisplay,
  defaultReviewDateFromInjury,
} from "./assessmentDatesCore";

export type AssessmentDateInput = {
  injuryDate: string;
  reviewDate: string;
};

export function resolveAssessmentDatesForSave(opts: {
  injuryDate: string | null | undefined;
  reviewDate: string | null | undefined;
}): { injury_date: string | null; review_date: string | null } {
  let injury = toDateOnly(opts.injuryDate);
  let review = toDateOnly(opts.reviewDate);
  if (!review && injury) {
    review = defaultReviewDateFromInjury(injury);
  }
  return { injury_date: injury, review_date: review };
}

export function injuryDatesToFormInput(
  injuryDate: string | null | undefined,
  reviewDate: string | null | undefined
): AssessmentDateInput {
  const injury = toDateOnly(injuryDate) ?? "";
  const review =
    toDateOnly(reviewDate) ?? defaultReviewDateFromInjury(injury) ?? "";
  return { injuryDate: injury, reviewDate: review };
}
