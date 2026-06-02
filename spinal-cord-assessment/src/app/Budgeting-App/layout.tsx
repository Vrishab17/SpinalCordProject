import "../../styles/budgeting.css";

export const metadata = {
  title: "Budget Tracker",
  description: "Personal budgeting app with expense tracking and insights",
};

export default function BudgetingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
