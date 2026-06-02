"use client";

import type { Period } from "@/lib/budgeting/types";

interface PeriodToggleProps {
  value: Period;
  onChange: (period: Period) => void;
  variant?: "header" | "inline";
}

const PERIODS: { value: Period; label: string }[] = [
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "yearly", label: "Yearly" },
];

export default function PeriodToggle({
  value,
  onChange,
  variant = "header",
}: PeriodToggleProps) {
  if (variant === "inline") {
    return (
      <div className="budget-period-toggle" style={{ background: "#edf0f5" }}>
        {PERIODS.map((p) => (
          <button
            key={p.value}
            type="button"
            className={value === p.value ? "active" : ""}
            onClick={() => onChange(p.value)}
            style={
              value === p.value
                ? { background: "#2d3e5e", color: "#ffffff" }
                : { color: "#64748b" }
            }
          >
            {p.label}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="budget-period-toggle">
      {PERIODS.map((p) => (
        <button
          key={p.value}
          type="button"
          className={value === p.value ? "active" : ""}
          onClick={() => onChange(p.value)}
        >
          {p.label}
        </button>
      ))}
    </div>
  );
}
