"use client";

import { Exam } from "isncsci";

type Props = {
  exam: Exam;
  setExam: React.Dispatch<React.SetStateAction<Exam>>;
};

const levels = [
  "C2","C3","C4","C5","C6","C7","C8",
  "T1","T2","T3","T4","T5","T6","T7","T8","T9","T10","T11","T12",
  "L1","L2","L3","L4","L5",
  "S1","S2","S3","S4_5"
];

// vertical spacing
const getY = (index: number) => 40 + index * 10;

// color mapping
const getColor = (value: string) => {
  if (value === "2") return "#4CAF50"; // green
  if (value === "1") return "#FFC107"; // yellow
  if (value === "0") return "#F44336"; // red
  return "#ccc"; // NT
};

// cycle values
const nextValue = (current: string) => {
  if (current === "0") return "1";
  if (current === "1") return "2";
  if (current === "2") return "0";
  return "0";
};

export default function BodyDiagram({ exam, setExam }: Props) {

  const handleClick = (side: "left" | "right", level: string) => {
    const current = (exam[side].lightTouch as any)[level];

    setExam(prev => ({
      ...prev,
      [side]: {
        ...prev[side],
        lightTouch: {
          ...prev[side].lightTouch,
          [level]: nextValue(current)
        }
      }
    }));
  };

  return (
    <div style={{ display: "flex", justifyContent: "center", margin: "20px 0" }}>
      <svg width="300" height="450">

        {/* LEFT SIDE */}
        {levels.map((level, i) => (
          <g key={"left-" + level}>
            <circle
              cx={80}
              cy={getY(i)}
              r={6}
              fill={getColor((exam.left.lightTouch as any)[level])}
              onClick={() => handleClick("left", level)}
              style={{ cursor: "pointer" }}
            />
            <text x={50} y={getY(i) + 4} fontSize="8">
              {level}
            </text>
          </g>
        ))}

        {/* BODY CENTER LINE */}
        <line x1="150" y1="20" x2="150" y2="420" stroke="#999" strokeWidth="2" />

        {/* RIGHT SIDE */}
        {levels.map((level, i) => (
          <g key={"right-" + level}>
            <circle
              cx={220}
              cy={getY(i)}
              r={6}
              fill={getColor((exam.right.lightTouch as any)[level])}
              onClick={() => handleClick("right", level)}
              style={{ cursor: "pointer" }}
            />
            <text x={230} y={getY(i) + 4} fontSize="8">
              {level}
            </text>
          </g>
        ))}

      </svg>
    </div>
  );
}