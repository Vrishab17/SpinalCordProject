"use client";

import type { BudgetCategory, Period } from "@/lib/budgeting/types";
import CategoryRow from "./CategoryRow";

interface CategoryListProps {
  categories: BudgetCategory[];
  onAmountChange: (id: string, amount: number, period: Period) => void;
  onRename: (id: string, name: string) => void;
  onAdd: () => void;
  onRemove: (id: string) => void;
}

export default function CategoryList({
  categories,
  onAmountChange,
  onRename,
  onAdd,
  onRemove,
}: CategoryListProps) {
  return (
    <div className="budget-card">
      <div className="budget-category-header">
        <h2 className="budget-card-title" style={{ margin: 0 }}>
          Expense Categories
        </h2>
        <button
          type="button"
          className="budget-btn budget-btn-primary"
          onClick={onAdd}
        >
          + Add Category
        </button>
      </div>

      <div className="budget-category-list">
        {categories.map((category) => (
          <CategoryRow
            key={category.id}
            category={category}
            canDelete={categories.length > 1}
            onAmountChange={onAmountChange}
            onRename={onRename}
            onRemove={onRemove}
          />
        ))}
      </div>
    </div>
  );
}
