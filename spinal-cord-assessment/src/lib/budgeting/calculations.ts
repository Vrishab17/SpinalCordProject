import { fromMonthly } from "./periodConversion";
import type { BudgetCategory, BudgetState, Period } from "./types";

export interface BudgetMetrics {
  income: number;
  expenses: number;
  remaining: number;
  savingsRate: number | null;
  topCategory: { name: string; percentage: number } | null;
}

export interface ChartSlice {
  name: string;
  value: number;
  color: string;
  percentage: number;
}

export function totalExpensesMonthly(categories: BudgetCategory[]): number {
  return categories.reduce((sum, cat) => sum + cat.amountMonthly, 0);
}

export function computeMetrics(state: BudgetState): BudgetMetrics {
  const expensesMonthly = totalExpensesMonthly(state.categories);
  const income = fromMonthly(state.incomeMonthly, state.displayPeriod);
  const expenses = fromMonthly(expensesMonthly, state.displayPeriod);
  const remaining = income - expenses;
  const savingsRate =
    state.incomeMonthly > 0
      ? ((state.incomeMonthly - expensesMonthly) / state.incomeMonthly) * 100
      : null;

  let topCategory: BudgetMetrics["topCategory"] = null;
  if (expensesMonthly > 0) {
    const sorted = [...state.categories]
      .filter((c) => c.amountMonthly > 0)
      .sort((a, b) => b.amountMonthly - a.amountMonthly);
    if (sorted.length > 0) {
      topCategory = {
        name: sorted[0].name,
        percentage: (sorted[0].amountMonthly / expensesMonthly) * 100,
      };
    }
  }

  return { income, expenses, remaining, savingsRate, topCategory };
}

export function computeChartData(
  categories: BudgetCategory[],
  period: Period
): ChartSlice[] {
  const totalMonthly = totalExpensesMonthly(categories);
  if (totalMonthly <= 0) return [];

  return categories
    .filter((c) => c.amountMonthly > 0)
    .map((c) => ({
      name: c.name,
      value: fromMonthly(c.amountMonthly, period),
      color: c.color,
      percentage: (c.amountMonthly / totalMonthly) * 100,
    }))
    .sort((a, b) => b.value - a.value);
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`;
}
