import { createDefaultState, type BudgetCategory, type BudgetState, type Period } from "./types";

export const STORAGE_KEY = "budgeting-app-v1";

function isPeriod(value: unknown): value is Period {
  return value === "weekly" || value === "monthly" || value === "yearly";
}

function isValidCategory(value: unknown): value is BudgetCategory {
  if (!value || typeof value !== "object") return false;
  const cat = value as Record<string, unknown>;
  return (
    typeof cat.id === "string" &&
    typeof cat.name === "string" &&
    typeof cat.color === "string" &&
    typeof cat.amountMonthly === "number" &&
    Number.isFinite(cat.amountMonthly)
  );
}

function parseBudgetState(raw: unknown): BudgetState | null {
  if (!raw || typeof raw !== "object") return null;
  const data = raw as Record<string, unknown>;

  if (typeof data.incomeMonthly !== "number" || !Number.isFinite(data.incomeMonthly)) {
    return null;
  }
  if (!Array.isArray(data.categories) || data.categories.length === 0) {
    return null;
  }
  if (!data.categories.every(isValidCategory)) {
    return null;
  }
  if (!isPeriod(data.displayPeriod)) {
    return null;
  }

  return {
    incomeMonthly: data.incomeMonthly,
    categories: data.categories,
    displayPeriod: data.displayPeriod,
  };
}

export function loadBudget(): BudgetState {
  if (typeof window === "undefined") {
    return createDefaultState();
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return createDefaultState();
    const parsed = parseBudgetState(JSON.parse(raw));
    return parsed ?? createDefaultState();
  } catch {
    return createDefaultState();
  }
}

export function saveBudget(state: BudgetState): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Ignore quota or privacy errors
  }
}

export function clearBudget(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}
