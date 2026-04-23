"use client";

import { Exam } from "isncsci";

type Props = {
  exam: Exam;
  setExam: React.Dispatch<React.SetStateAction<Exam>>;
  side: "left" | "right";
};

const motorLevels = ["C5","C6","C7","C8","T1","L2","L3","L4","L5","S1"];

export default function MotorScoreTable({ exam, setExam, side }: Props) {

  const handleChange = (level: string, value: string) => {
    setExam(prev => ({
      ...prev,
      [side]: {
        ...prev[side],
        motor: {
          ...prev[side].motor,
          [level]: value
        }
      }
    }));
  };

  return (
    <div>
      <h4>{side.toUpperCase()} Motor</h4>

      {motorLevels.map(level => (
        <div key={level}>
          <label>{level}</label>
          <select
            value={exam[side].motor[level as keyof typeof exam[typeof side].motor]}
            onChange={(e) => handleChange(level, e.target.value)}
          >
            <option value="0">0</option>
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
            <option value="4">4</option>
            <option value="5">5</option>
            <option value="NT">NT</option>
          </select>
        </div>
      ))}

    </div>
  );
}
