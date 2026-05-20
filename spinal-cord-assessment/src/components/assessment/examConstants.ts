export const LEVELS = [
  "C2",
  "C3",
  "C4",
  "C5",
  "C6",
  "C7",
  "C8",
  "T1",
  "T2",
  "T3",
  "T4",
  "T5",
  "T6",
  "T7",
  "T8",
  "T9",
  "T10",
  "T11",
  "T12",
  "L1",
  "L2",
  "L3",
  "L4",
  "L5",
  "S1",
  "S2",
  "S3",
  "S4_5",
] as const;

export const MOTOR_LEVELS = [
  "C5",
  "C6",
  "C7",
  "C8",
  "T1",
  "L2",
  "L3",
  "L4",
  "L5",
  "S1",
] as const;

export const MOTOR_KEY_LABELS: Record<(typeof MOTOR_LEVELS)[number], string> =
  {
    C5: "Elbow flexors",
    C6: "Wrist extensors",
    C7: "Elbow extensors",
    C8: "Finger flexors",
    T1: "Small finger abductors",
    L2: "Hip flexors",
    L3: "Knee extensors",
    L4: "Ankle dorsiflexors",
    L5: "Long toe extensors",
    S1: "Ankle plantar flexors",
  };

export const UPPER_MOTOR_LEVELS = ["C5", "C6", "C7", "C8", "T1"] as const;
export const LOWER_MOTOR_LEVELS = ["L2", "L3", "L4", "L5", "S1"] as const;
