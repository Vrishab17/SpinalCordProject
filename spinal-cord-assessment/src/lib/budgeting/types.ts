export type Period = "weekly" | "monthly" | "yearly";

export interface BudgetCategory {
  id: string;
  name: string;
  color: string;
  amountMonthly: number;
}

export interface BudgetState {
  incomeMonthly: number;
  categories: BudgetCategory[];
  displayPeriod: Period;
}

export const CHART_COLORS = [
  "#2D3E5E",
  "#2E7D5A",
  "#C45C4A",
  "#1FC2D5",
  "#8B5CF6",
  "#F59E0B",
  "#EC4899",
  "#6366F1",
  "#14B8A6",
  "#64748B",
] as const;

export const DEFAULT_CATEGORIES: Omit<BudgetCategory, "id">[] = [
  { name: "Housing", color: CHART_COLORS[0], amountMonthly: 0 },
  { name: "Food", color: CHART_COLORS[1], amountMonthly: 0 },
  { name: "Transport", color: CHART_COLORS[2], amountMonthly: 0 },
  { name: "Utilities", color: CHART_COLORS[3], amountMonthly: 0 },
  { name: "Healthcare", color: CHART_COLORS[4], amountMonthly: 0 },
  { name: "Entertainment", color: CHART_COLORS[5], amountMonthly: 0 },
  { name: "Shopping", color: CHART_COLORS[6], amountMonthly: 0 },
  { name: "Subscriptions", color: CHART_COLORS[7], amountMonthly: 0 },
  { name: "Savings", color: CHART_COLORS[8], amountMonthly: 0 },
  { name: "Other", color: CHART_COLORS[9], amountMonthly: 0 },
];

export function createDefaultState(): BudgetState {
  return {
    incomeMonthly: 0,
    categories: DEFAULT_CATEGORIES.map((cat, i) => ({
      ...cat,
      id: `default-${i}`,
    })),
    displayPeriod: "monthly",
  };
}
