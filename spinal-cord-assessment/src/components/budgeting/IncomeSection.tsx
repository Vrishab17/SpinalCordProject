"use client";

import type { Period } from "@/lib/budgeting/types";
import { SyncedPeriodInputs } from "./PeriodInput";

interface IncomeSectionProps {
  incomeMonthly: number;
  onChange: (amount: number, period: Period) => void;
}

export default function IncomeSection({
  incomeMonthly,
  onChange,
}: IncomeSectionProps) {
  return (
    <div className="budget-card">
      <h2 className="budget-card-title">Income</h2>
      <p style={{ margin: "0 0 16px", fontSize: 14, color: "#64748b" }}>
        Enter your income in any period — the others update automatically.
      </p>
      <SyncedPeriodInputs monthlyAmount={incomeMonthly} onChange={onChange} />
    </div>
  );
}
