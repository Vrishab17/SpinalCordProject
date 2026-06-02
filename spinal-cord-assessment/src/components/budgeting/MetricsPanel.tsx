"use client";

import {
  computeMetrics,
  formatCurrency,
  formatPercent,
} from "@/lib/budgeting/calculations";
import { periodLabel } from "@/lib/budgeting/periodConversion";
import type { BudgetState } from "@/lib/budgeting/types";

interface MetricsPanelProps {
  state: BudgetState;
}

export default function MetricsPanel({ state }: MetricsPanelProps) {
  const metrics = computeMetrics(state);
  const period = periodLabel(state.displayPeriod);

  const remainingClass =
    metrics.remaining >= 0 ? "remaining-positive" : "remaining-negative";

  return (
    <div className="budget-metrics-grid">
      <div className="budget-metric-card">
        <p className="budget-metric-label">Total Income</p>
        <p className="budget-metric-value income">
          {formatCurrency(metrics.income)}
        </p>
        <p className="budget-metric-sub">{period}</p>
      </div>

      <div className="budget-metric-card">
        <p className="budget-metric-label">Total Expenses</p>
        <p className="budget-metric-value expense">
          {formatCurrency(metrics.expenses)}
        </p>
        <p className="budget-metric-sub">{period}</p>
      </div>

      <div className="budget-metric-card">
        <p className="budget-metric-label">Remaining Budget</p>
        <p className={`budget-metric-value ${remainingClass}`}>
          {formatCurrency(metrics.remaining)}
        </p>
        <p className="budget-metric-sub">{period}</p>
      </div>

      <div className="budget-metric-card">
        <p className="budget-metric-label">Savings Rate</p>
        <p className="budget-metric-value">
          {metrics.savingsRate !== null
            ? formatPercent(metrics.savingsRate)
            : "—"}
        </p>
        <p className="budget-metric-sub">
          {metrics.topCategory
            ? `Top: ${metrics.topCategory.name} (${formatPercent(metrics.topCategory.percentage)})`
            : "Of income saved"}
        </p>
      </div>
    </div>
  );
}
