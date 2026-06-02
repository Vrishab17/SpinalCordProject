"use client";

import BudgetPieChart from "@/components/budgeting/BudgetPieChart";
import CategoryList from "@/components/budgeting/CategoryList";
import IncomeSection from "@/components/budgeting/IncomeSection";
import MetricsPanel from "@/components/budgeting/MetricsPanel";
import PeriodToggle from "@/components/budgeting/PeriodToggle";
import { useBudgetStore } from "@/hooks/useBudgetStore";

export default function BudgetingClient() {
  const {
    state,
    hydrated,
    setDisplayPeriod,
    setIncome,
    setCategoryAmount,
    renameCategory,
    addCategory,
    removeCategory,
    resetAll,
  } = useBudgetStore();

  if (!hydrated) {
    return <div className="budget-loading">Loading your budget...</div>;
  }

  function handleReset() {
    if (
      window.confirm(
        "Reset all budget data? This will clear your saved income and expenses."
      )
    ) {
      resetAll();
    }
  }

  return (
    <div className="budget-page">
      <header className="budget-header">
        <div>
          <h1>Budget Tracker</h1>
          <p>Track income, expenses, and see where your money goes</p>
        </div>
        <PeriodToggle
          value={state.displayPeriod}
          onChange={setDisplayPeriod}
        />
      </header>

      <div className="budget-container">
        <MetricsPanel state={state} />

        <div className="budget-main-grid">
          <IncomeSection
            incomeMonthly={state.incomeMonthly}
            onChange={setIncome}
          />
          <BudgetPieChart
            categories={state.categories}
            displayPeriod={state.displayPeriod}
          />
        </div>

        <CategoryList
          categories={state.categories}
          onAmountChange={setCategoryAmount}
          onRename={renameCategory}
          onAdd={addCategory}
          onRemove={removeCategory}
        />

        <div className="budget-footer-actions">
          <button
            type="button"
            className="budget-btn budget-btn-ghost"
            onClick={handleReset}
          >
            Reset all data
          </button>
        </div>
      </div>
    </div>
  );
}
