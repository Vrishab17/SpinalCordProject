"use client";

import { Exam } from "isncsci";

type Props = {
  exam: Exam;
  setExam: React.Dispatch<React.SetStateAction<Exam>>;
  side: "left" | "right";
};

const sensoryLevels = [
  "C2","C3","C4","C5","C6","C7","C8",
  "T1","T2","T3","T4","T5","T6","T7","T8","T9","T10","T11","T12",
  "L1","L2","L3","L4","L5",
  "S1","S2","S3","S4_5"
];

export default function SensoryScoreTable({ exam, setExam, side }: Props) {

  const handleChange = (
    type: "lightTouch" | "pinPrick",
    level: string,
    value: string
  ) => {
    setExam(prev => ({
      ...prev,
      [side]: {
        ...prev[side],
        [type]: {
          ...prev[side][type],
          [level]: value as any 
        }
      }
    }));
  };

  return (
    <div>
      <h4>{side.toUpperCase()} Sensory</h4>

      {sensoryLevels.map((level) => (
        <div key={level}>
          <label>{level}</label>

          <span> LT </span>
          <select
            value={(exam[side].lightTouch as any)[level]}  
            onChange={(e) =>
              handleChange("lightTouch", level, e.target.value)
            }
          >
            <option value="0">0</option>
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="NT">NT</option>
          </select>

          <span> PP </span>
          <select
            value={(exam[side].pinPrick as any)[level]} 
            onChange={(e) =>
              handleChange("pinPrick", level, e.target.value)
            }
          >
            <option value="0">0</option>
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="NT">NT</option>
          </select>
        </div>
      ))}
    </div>
  );
}