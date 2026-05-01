"use client";

export default function ScoreBox({
  value,
  wide = false,
}: {
  value: string | number | undefined;
  wide?: boolean;
}) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        minWidth: wide ? "100px" : "70px",
        minHeight: "28px",
        borderBottom: "1px solid #C43BFF",
        padding: "2px 6px",
        boxSizing: "border-box",
      }}
    >
      {value ?? ""}
    </span>
  );
}