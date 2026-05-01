"use client";

import { useState } from "react";
import BodyDiagram from "./BodyDiagram";
import { runAssessment } from "@/lib/isncsci";
import { Exam, Score } from "@/types/exam";

/* LEVELS */
const LEVELS = [
  "C2","C3","C4","C5","C6","C7","C8","T1",
  "T2","T3","T4","T5","T6","T7","T8","T9",
  "T10","T11","T12","L1","L2","L3","L4","L5",
  "S1","S2","S3","S4_5"
];

/* MOTOR LEVELS (ONLY THESE GET MOTOR INPUTS) */
const MOTOR_LEVELS = [
  "C5","C6","C7","C8","T1","L2","L3","L4","L5","S1"
];

const MOTOR_OPTIONS = [
  { value: "C5", label: "C5 - Shoulder / Elbow Flexion" },
  { value: "C6", label: "C6 - Elbow / Wrist Extension" },
  { value: "C7", label: "C7 - Elbow Extension" },
  { value: "C8", label: "C8 - Finger Flexion" },
  { value: "T1", label: "T1 - Finger Abduction" },
  { value: "L2", label: "L2 - Hip Flexion" },
  { value: "L3", label: "L3 - Knee Extension" },
  { value: "L4", label: "L4 - Ankle Dorsiflexion" },
  { value: "L5", label: "L5 - Great Toe Extension" },
  { value: "S1", label: "S1 - Ankle Plantarflexion" },
];

const SCORES: Score[] = ["0","1","2"];
type YesNoNT = "Yes" | "No" | "NT" | "UNK";

/* HELPERS */
const createEmpty = () =>
  Object.fromEntries(LEVELS.map(l => [l, "0"])) as Record<string, Score>;

const defaultExam: Exam = {
  right: {
    lowestNonKeyMuscleWithMotorFunction: "C5",
    motor: createEmpty(),
    lightTouch: createEmpty(),
    pinPrick: createEmpty(),
  },
  left: {
    lowestNonKeyMuscleWithMotorFunction: "C5",
    motor: createEmpty(),
    lightTouch: createEmpty(),
    pinPrick: createEmpty(),
  },
  deepAnalPressure: "No",
  voluntaryAnalContraction: "No",
};

export default function AssessmentForm() {
  const [exam, setExam] = useState(defaultExam);

  const update = (
    side: "right" | "left",
    type: "motor" | "lightTouch" | "pinPrick",
    level: string,
    value: Score
  ) => {
    setExam(prev => ({
      ...prev,
      [side]: {
        ...prev[side],
        [type]: {
          ...prev[side][type],
          [level]: value,
        },
      },
    }));
  };

  const renderSelect = (value: Score, onChange: any) => (
    <select value={value} onChange={onChange} style={{ width: "45px" }}>
      {SCORES.map(s => <option key={s}>{s}</option>)}
    </select>
  );

  const rowStyle = {
    height: "32px",
    display: "flex",
    alignItems: "center",
    gap: "6px"
  };

  return (
    <div style={{ marginTop: "20px" }}>

      {/* MAIN GRID */}
      <div style={{ display: "flex", justifyContent: "space-between" }}>

        {/* RIGHT SIDE */}
        <div>
          <strong>Right</strong>
          <div style={{ display: "flex", gap: "10px", fontWeight: "bold" }}>
            <span>M</span><span>LT</span><span>PP</span>
          </div>

          {LEVELS.map(level => (
            <div key={"r-"+level} style={rowStyle}>
              <span style={{ width: "40px" }}>{level}</span>

              {MOTOR_LEVELS.includes(level)
                ? renderSelect(
                    exam.right.motor[level],
                    (e:any)=>update("right","motor",level,e.target.value)
                  )
                : <div style={{ width: "45px" }} />
              }

              {renderSelect(
                exam.right.lightTouch[level],
                (e:any)=>update("right","lightTouch",level,e.target.value)
              )}

              {renderSelect(
                exam.right.pinPrick[level],
                (e:any)=>update("right","pinPrick",level,e.target.value)
              )}
            </div>
          ))}
        </div>

        {/* BODY DIAGRAM */}
        <div>
          <BodyDiagram exam={exam} />
        </div>

        {/* LEFT SIDE */}
        <div>
          <strong>Left</strong>
          <div style={{ display: "flex", gap: "10px", fontWeight: "bold" }}>
            <span>LT</span><span>PP</span><span>M</span>
          </div>

          {LEVELS.map(level => (
            <div key={"l-"+level} style={rowStyle}>

              {renderSelect(
                exam.left.lightTouch[level],
                (e:any)=>update("left","lightTouch",level,e.target.value)
              )}

              {renderSelect(
                exam.left.pinPrick[level],
                (e:any)=>update("left","pinPrick",level,e.target.value)
              )}

              {MOTOR_LEVELS.includes(level)
                ? renderSelect(
                    exam.left.motor[level],
                    (e:any)=>update("left","motor",level,e.target.value)
                  )
                : <div style={{ width: "45px" }} />
              }

              <span style={{ width: "40px" }}>{level}</span>
            </div>
          ))}
        </div>
      </div>

      {/* BOTTOM SECTION */}
      <div style={{ marginTop: "40px", display: "flex", justifyContent: "space-between" }}>

        {/* VAC */}
        <label>
          (VAC) Voluntary anal contraction
          <br />
          <select
            value={exam.voluntaryAnalContraction}
            onChange={e =>
              setExam(prev => ({
                ...prev,
                voluntaryAnalContraction: e.target.value as YesNoNT
              }))
            }
          >
            <option>Yes</option>
            <option>No</option>
            <option>NT</option>
            <option>UNK</option>
          </select>
        </label>

        {/* DAP */}
        <label>
          (DAP) Deep anal pressure
          <br />
          <select
            value={exam.deepAnalPressure}
            onChange={e =>
              setExam(prev => ({
                ...prev,
                deepAnalPressure: e.target.value as YesNoNT
              }))
            }
          >
            <option>Yes</option>
            <option>No</option>
            <option>NT</option>
            <option>UNK</option>
          </select>
        </label>
      </div>

      {/* LOWEST MOTOR + COMMENTS */}
      <div style={{ marginTop: "20px", display: "flex", gap: "40px" }}>
        <div>
          <strong>Lowest non-key muscle with motor function</strong>

          <div>
            Right:
            <br />
            <select
              value={exam.right.lowestNonKeyMuscleWithMotorFunction}
              onChange={e =>
                setExam(prev => ({
                  ...prev,
                  right: {
                    ...prev.right,
                    lowestNonKeyMuscleWithMotorFunction: e.target.value
                  }
                }))
              }
            >
              {MOTOR_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>

          <div>
            Left:
            <br />
            <select
              value={exam.left.lowestNonKeyMuscleWithMotorFunction}
              onChange={e =>
                setExam(prev => ({
                  ...prev,
                  left: {
                    ...prev.left,
                    lowestNonKeyMuscleWithMotorFunction: e.target.value
                  }
                }))
              }
            >
              {MOTOR_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <strong>Comments:</strong>
          <br />
          <textarea style={{ width: "300px", height: "100px" }} />
        </div>
      </div>

      {/* CALCULATE */}
      <div style={{ marginTop: "20px" }}>
        <button onClick={() => console.log(runAssessment(exam))}>
          Calculate
        </button>
      </div>

    </div>
  );
}