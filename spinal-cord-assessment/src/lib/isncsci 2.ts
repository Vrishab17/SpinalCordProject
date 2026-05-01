import { ISNCSCI, Exam } from "isncsci";

export function runAssessment(exam: Exam) {
  const result = new ISNCSCI(exam);

  return {
    classification: result.classification,
    totals: result.totals,
  };
}