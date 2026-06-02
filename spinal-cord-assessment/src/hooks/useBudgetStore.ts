"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { toMonthly } from "@/lib/budgeting/periodConversion";
import { clearBudget, loadBudget, saveBudget } from "@/lib/budgeting/storage";
import {
  CHART_COLORS,
  createDefaultState,
  type BudgetCategory,
  type BudgetState,
  type Period,
} from "@/lib/budgeting/types";

const SAVE_DELAY_MS = 300;

export function useBudgetStore() {
  const [state, setState] = useState<BudgetState>(createDefaultState);
  const [hydrated, setHydrated] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setState(loadBudget());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;

    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      saveBudget(state);
    }, SAVE_DELAY_MS);

    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [state, hydrated]);

  const setDisplayPeriod = useCallback((displayPeriod: Period) => {
    setState((prev) => ({ ...prev, displayPeriod }));
  }, []);

  const setIncome = useCallback((amount: number, period: Period) => {
    setState((prev) => ({
      ...prev,
      incomeMonthly: toMonthly(amount, period),
    }));
  }, []);

  const setCategoryAmount = useCallback(
    (id: string, amount: number, period: Period) => {
      setState((prev) => ({
        ...prev,
        categories: prev.categories.map((cat) =>
          cat.id === id
            ? { ...cat, amountMonthly: toMonthly(amount, period) }
            : cat
        ),
      }));
    },
    []
  );

  const renameCategory = useCallback((id: string, name: string) => {
    setState((prev) => ({
      ...prev,
      categories: prev.categories.map((cat) =>
        cat.id === id ? { ...cat, name } : cat
      ),
    }));
  }, []);

  const addCategory = useCallback(() => {
    setState((prev) => {
      const color = CHART_COLORS[prev.categories.length % CHART_COLORS.length];
      const newCategory: BudgetCategory = {
        id: `custom-${Date.now()}`,
        name: "New Category",
        color,
        amountMonthly: 0,
      };
      return { ...prev, categories: [...prev.categories, newCategory] };
    });
  }, []);

  const removeCategory = useCallback((id: string) => {
    setState((prev) => {
      if (prev.categories.length <= 1) return prev;
      return {
        ...prev,
        categories: prev.categories.filter((cat) => cat.id !== id),
      };
    });
  }, []);

  const resetAll = useCallback(() => {
    clearBudget();
    setState(createDefaultState());
  }, []);

  return {
    state,
    hydrated,
    setDisplayPeriod,
    setIncome,
    setCategoryAmount,
    renameCategory,
    addCategory,
    removeCategory,
    resetAll,
  };
}
