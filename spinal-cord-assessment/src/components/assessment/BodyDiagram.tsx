"use client";

import { Exam } from "@/types/exam";

type Props = {
  exam: Exam;
};

export default function BodyDiagram({ exam }: Props) {
  const getColor = (level: string) => {
    const values = [
      exam.right.lightTouch[level],
      exam.right.pinPrick[level],
      exam.left.lightTouch[level],
      exam.left.pinPrick[level],
    ];

    if (values.includes("2")) return "rgba(126,217,87,0.5)";
    if (values.includes("1")) return "rgba(255,224,102,0.5)";
    return "transparent";
  };

  return (
    <div style={{ position: "relative", width: "300px", margin: "0 auto" }}>
      {/* BASE IMAGE */}
      <img
        src="/bodyDiagram.svg"
        alt="Body Diagram"
        style={{ width: "100%", display: "block" }}
      />

      {/* ===== OVERLAY ZONES ===== */}

      {/* C5 shoulders */}
      <div
        style={{
          position: "absolute",
          top: "18%",
          left: "15%",
          width: "70%",
          height: "8%",
          background: getColor("C5"),
        }}
      />

      {/* C6 arms */}
      <div
        style={{
          position: "absolute",
          top: "25%",
          left: "10%",
          width: "80%",
          height: "12%",
          background: getColor("C6"),
        }}
      />

      {/* T4 chest */}
      <div
        style={{
          position: "absolute",
          top: "30%",
          left: "25%",
          width: "50%",
          height: "10%",
          background: getColor("T4"),
        }}
      />

      {/* T10 abdomen */}
      <div
        style={{
          position: "absolute",
          top: "42%",
          left: "25%",
          width: "50%",
          height: "10%",
          background: getColor("T10"),
        }}
      />

      {/* L3 thighs */}
      <div
        style={{
          position: "absolute",
          top: "55%",
          left: "30%",
          width: "40%",
          height: "12%",
          background: getColor("L3"),
        }}
      />

      {/* S1 feet */}
      <div
        style={{
          position: "absolute",
          top: "75%",
          left: "35%",
          width: "30%",
          height: "10%",
          background: getColor("S1"),
        }}
      />
    </div>
  );
}