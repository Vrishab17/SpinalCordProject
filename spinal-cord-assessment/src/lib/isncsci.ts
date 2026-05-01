import { Exam } from "../types/exam";

export function runAssessment(exam: Exam) {
  // TEMP mock logic
  return {
    classification: "AIS A",
    totals: {
      motor: 0,
      sensory: 0
    }
  };
}