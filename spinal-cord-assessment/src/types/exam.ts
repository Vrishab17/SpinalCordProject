export type Score = "0" | "1" | "2" | "3" | "4" | "5" | "NT";

export type Sensory = Record<string, Score>;
export type Motor = Record<string, Score>;

export type ExamSide = {
  motor: Motor;
  lightTouch: Sensory;
  pinPrick: Sensory;
  lowestNonKeyMuscleWithMotorFunction: string;
};

export type Exam = {
  right: ExamSide;
  left: ExamSide;
  deepAnalPressure: "Yes" | "No" | "NT" | "UNK";
  voluntaryAnalContraction: "Yes" | "No" | "NT" | "UNK";
};