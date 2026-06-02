import type { Period } from "./types";

export function monthlyToWeekly(monthly: number): number {
  return (monthly * 12) / 52;
}

export function monthlyToYearly(monthly: number): number {
  return monthly * 12;
}

export function weeklyToMonthly(weekly: number): number {
  return (weekly * 52) / 12;
}

export function yearlyToMonthly(yearly: number): number {
  return yearly / 12;
}

export function toMonthly(amount: number, period: Period): number {
  switch (period) {
    case "weekly":
      return weeklyToMonthly(amount);
    case "yearly":
      return yearlyToMonthly(amount);
    default:
      return amount;
  }
}

export function fromMonthly(monthly: number, period: Period): number {
  switch (period) {
    case "weekly":
      return monthlyToWeekly(monthly);
    case "yearly":
      return monthlyToYearly(monthly);
    default:
      return monthly;
  }
}

export function periodLabel(period: Period): string {
  switch (period) {
    case "weekly":
      return "Weekly";
    case "yearly":
      return "Yearly";
    default:
      return "Monthly";
  }
}
