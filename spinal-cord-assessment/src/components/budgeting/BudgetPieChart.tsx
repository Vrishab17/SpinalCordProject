"use client";

import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import {
  computeChartData,
  formatCurrency,
  formatPercent,
} from "@/lib/budgeting/calculations";
import { periodLabel } from "@/lib/budgeting/periodConversion";
import type { BudgetCategory, Period } from "@/lib/budgeting/types";

interface BudgetPieChartProps {
  categories: BudgetCategory[];
  displayPeriod: Period;
}

interface TooltipPayload {
  name: string;
  value: number;
  payload: {
    color: string;
    percentage: number;
  };
}

function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: TooltipPayload[];
}) {
  if (!active || !payload?.length) return null;
  const item = payload[0];

  return (
    <div
      style={{
        background: "#ffffff",
        border: "1px solid #d6d6d6",
        borderRadius: 8,
        padding: "10px 14px",
        boxShadow: "0 4px 12px rgba(21, 40, 76, 0.12)",
      }}
    >
      <p style={{ margin: 0, fontWeight: 600, color: "#15284c" }}>
        {item.name}
      </p>
      <p style={{ margin: "4px 0 0", fontSize: 13, color: "#64748b" }}>
        {formatCurrency(item.value)} · {formatPercent(item.payload.percentage)}
      </p>
    </div>
  );
}

export default function BudgetPieChart({
  categories,
  displayPeriod,
}: BudgetPieChartProps) {
  const data = computeChartData(categories, displayPeriod);
  const period = periodLabel(displayPeriod);

  if (data.length === 0) {
    return (
      <div className="budget-card">
        <h2 className="budget-card-title">Expense Breakdown</h2>
        <div className="budget-chart-empty">
          <p>Add expenses to see breakdown</p>
        </div>
      </div>
    );
  }

  return (
    <div className="budget-card">
      <h2 className="budget-card-title">Expense Breakdown</h2>
      <p style={{ margin: "0 0 8px", fontSize: 13, color: "#94a3b8" }}>
        Showing {period.toLowerCase()} amounts
      </p>

      <div className="budget-chart-container">
        <ResponsiveContainer width="100%" height={260}>
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={95}
              paddingAngle={2}
              stroke="#ffffff"
              strokeWidth={2}
            >
              {data.map((entry) => (
                <Cell key={entry.name} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="budget-legend">
        {data.map((item) => (
          <div key={item.name} className="budget-legend-item">
            <div className="budget-legend-left">
              <span
                className="budget-color-dot"
                style={{ backgroundColor: item.color }}
              />
              <span className="budget-legend-name">{item.name}</span>
            </div>
            <span className="budget-legend-value">
              {formatPercent(item.percentage)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
