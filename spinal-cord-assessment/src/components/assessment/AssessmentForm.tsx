"use client";

import { useState } from "react";
import { Exam } from "isncsci";
import { runAssessment } from "@/lib/isncsci";

// your components
import MotorScoreTable from "./MotorScoreTable";
import SensoryScoreTable from "./SensoryScoreTable";
import AISClassification from "./AISClassification";

const createEmptySensory = () => ({
  C2: "0", C3: "0", C4: "0", C5: "0", C6: "0", C7: "0", C8: "0",
  T1: "0", T2: "0", T3: "0", T4: "0", T5: "0", T6: "0", T7: "0",
  T8: "0", T9: "0", T10: "0", T11: "0", T12: "0",
  L1: "0", L2: "0", L3: "0", L4: "0", L5: "0",
  S1: "0", S2: "0", S3: "0", S4_5: "0",
});

const createEmptyMotor = () => ({
  C5: "0", C6: "0", C7: "0", C8: "0", T1: "0",
  L2: "0", L3: "0", L4: "0", L5: "0", S1: "0",
});

const defaultExam: Exam = {
  deepAnalPressure: "No",
  voluntaryAnalContraction: "No",
  right: {
    lowestNonKeyMuscleWithMotorFunction: "C5",
    motor: createEmptyMotor(),
    lightTouch: createEmptySensory(),
    pinPrick: createEmptySensory(),
  },
  left: {
    lowestNonKeyMuscleWithMotorFunction: "C5",
    motor: createEmptyMotor(),
    lightTouch: createEmptySensory(),
    pinPrick: createEmptySensory(),
  },
};

export default function AssessmentForm() {
  const [exam, setExam] = useState<Exam>(defaultExam);
  const [result, setResult] = useState<any>(null);

  const handleCalculate = () => {
    const output = runAssessment(exam);
    console.log("RESULT:", output);
    setResult(output);
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Assessment Form</h2>

      {/* MOTOR TABLES */}
      <h3>Motor Scores</h3>
      <MotorScoreTable exam={exam} setExam={setExam} side="right" />
      <MotorScoreTable exam={exam} setExam={setExam} side="left" />

      {/* SENSORY TABLES */}
      <h3>Sensory Scores</h3>
      <SensoryScoreTable exam={exam} setExam={setExam} side="right" />
      <SensoryScoreTable exam={exam} setExam={setExam} side="left" />

      {/* ANAL INPUTS */}
      <h3>Anal Function</h3>
      <div>
        <label>Deep Anal Pressure:</label>
        <select
          value={exam.deepAnalPressure}
          onChange={(e) =>
            setExam({ ...exam, deepAnalPressure: e.target.value as any })
          }
        >
          <option value="Yes">Yes</option>
          <option value="No">No</option>
          <option value="NT">NT</option>
        </select>
      </div>

      <div>
        <label>Voluntary Anal Contraction:</label>
        <select
          value={exam.voluntaryAnalContraction}
          onChange={(e) =>
            setExam({
              ...exam,
              voluntaryAnalContraction: e.target.value as any,
            })
          }
        >
          <option value="Yes">Yes</option>
          <option value="No">No</option>
          <option value="NT">NT</option>
        </select>
      </div>

      {/* CALCULATE BUTTON */}
      <br />
      <button onClick={handleCalculate}>Calculate</button>

      {/* RESULTS */}
      {result && (
        <div style={{ marginTop: "20px" }}>
          <h3>Results</h3>
          <AISClassification
            classification={result.classification}
            totals={result.totals}
          />
        </div>
      )}
    </div>
  );
}