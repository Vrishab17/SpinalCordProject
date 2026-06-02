"use client";

import type { BudgetCategory, Period } from "@/lib/budgeting/types";
import { SyncedPeriodInputs } from "./PeriodInput";

interface CategoryRowProps {
  category: BudgetCategory;
  canDelete: boolean;
  onAmountChange: (id: string, amount: number, period: Period) => void;
  onRename: (id: string, name: string) => void;
  onRemove: (id: string) => void;
}

export default function CategoryRow({
  category,
  canDelete,
  onAmountChange,
  onRename,
  onRemove,
}: CategoryRowProps) {
  return (
    <div className="budget-category-row">
      <div className="budget-category-name">
        <span
          className="budget-color-dot"
          style={{ backgroundColor: category.color }}
        />
        <input
          type="text"
          className="budget-name-input"
          value={category.name}
          onChange={(e) => onRename(category.id, e.target.value)}
          aria-label="Category name"
        />
      </div>

      <SyncedPeriodInputs
        monthlyAmount={category.amountMonthly}
        onChange={(amount, period) =>
          onAmountChange(category.id, amount, period)
        }
      />

      <button
        type="button"
        className="budget-btn budget-btn-danger"
        onClick={() => onRemove(category.id)}
        disabled={!canDelete}
        aria-label={`Remove ${category.name}`}
        title={canDelete ? "Remove category" : "At least one category required"}
      >
        ✕
      </button>
    </div>
  );
}
