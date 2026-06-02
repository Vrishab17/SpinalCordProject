"use client";

import { useEffect, useState } from "react";
import { fromMonthly } from "@/lib/budgeting/periodConversion";
import type { Period } from "@/lib/budgeting/types";

interface PeriodInputProps {
  label: string;
  monthlyAmount: number;
  period: Period;
  onChange: (amount: number, period: Period) => void;
}

function parseInput(value: string): number {
  const cleaned = value.replace(/[^0-9.-]/g, "");
  const parsed = parseFloat(cleaned);
  return Number.isFinite(parsed) ? parsed : 0;
}

function formatForInput(amount: number): string {
  if (amount === 0) return "";
  return amount.toFixed(2);
}

export default function PeriodInput({
  label,
  monthlyAmount,
  period,
  onChange,
}: PeriodInputProps) {
  const displayValue = fromMonthly(monthlyAmount, period);
  const [localValue, setLocalValue] = useState(formatForInput(displayValue));
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    if (!focused) {
      setLocalValue(formatForInput(fromMonthly(monthlyAmount, period)));
    }
  }, [monthlyAmount, period, focused]);

  function handleChange(raw: string) {
    setLocalValue(raw);
    onChange(parseInput(raw), period);
  }

  function handleBlur() {
    setFocused(false);
    const parsed = parseInput(localValue);
    setLocalValue(formatForInput(parsed));
  }

  return (
    <div className="budget-input-group">
      <label className="budget-input-label">{label}</label>
      <input
        type="text"
        inputMode="decimal"
        className="budget-input"
        placeholder="0.00"
        value={localValue}
        onChange={(e) => handleChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={handleBlur}
      />
    </div>
  );
}

interface SyncedPeriodInputsProps {
  monthlyAmount: number;
  onChange: (amount: number, period: Period) => void;
}

export function SyncedPeriodInputs({
  monthlyAmount,
  onChange,
}: SyncedPeriodInputsProps) {
  return (
    <div className="budget-period-inputs">
      <PeriodInput
        label="Weekly"
        monthlyAmount={monthlyAmount}
        period="weekly"
        onChange={onChange}
      />
      <PeriodInput
        label="Monthly"
        monthlyAmount={monthlyAmount}
        period="monthly"
        onChange={onChange}
      />
      <PeriodInput
        label="Yearly"
        monthlyAmount={monthlyAmount}
        period="yearly"
        onChange={onChange}
      />
    </div>
  );
}
