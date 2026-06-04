import { useMemo } from "react";
import { useAppContext } from "../../context/AppContext";
import { calculateAlerts } from "../../core/domain/alerts";
import { getTopBudgets } from "../../core/domain/budgets";
import { MonthlySummary } from "../dashboard/MonthlySummary";
import { AlertsList } from "../dashboard/AlertsList";
import { TopBudgetsList } from "../dashboard/TopBudgetsList";
import { RecentTransactionsTable } from "../dashboard/RecentTransactionsTable";

export default function DashboardView() {
  const { state } = useAppContext();

  const { totalIncome, totalExpenses, savings, alerts, recentTransactions, topBudgets } =
    useMemo(() => {
      const incomesMonth = state.incomes.filter((i: any) => i.month === state.currentMonth);
      const expensesMonth = state.expenses.filter((e: any) => e.month === state.currentMonth);

      const totalIncome = incomesMonth.reduce(
        (s: number, i: any) => s + (i.amount || 0),
        0
      );
      const totalExpenses = expensesMonth.reduce(
        (s: number, e: any) => s + (e.amount || 0),
        0
      );
      const savings = totalIncome - totalExpenses;

      const alerts = calculateAlerts(state as any);

      const recentTransactions = [...incomesMonth, ...expensesMonth]
        .map((t: any) => ({
          ...t,
          kind: t.amount >= 0 && state.incomes.includes(t) ? "income" : "expense"
        }))
        .sort((a, b) => {
          const da = a.date || a.createdAt || "";
          const db = b.date || b.createdAt || "";
          return db.localeCompare(da);
        })
        .slice(0, 5);

      const topBudgets = getTopBudgets(state as any, 4);

      return { totalIncome, totalExpenses, savings, alerts, recentTransactions, topBudgets };
    }, [state]);

  return (
    <div className="space-y-6">
      <MonthlySummary
        currentMonth={state.currentMonth}
        totalIncome={totalIncome}
        totalExpenses={totalExpenses}
        savings={savings}
      />

      <section className="grid gap-6 md:grid-cols-2">
        <AlertsList alerts={alerts} />
        <TopBudgetsList topBudgets={topBudgets} />
      </section>

      <RecentTransactionsTable recentTransactions={recentTransactions} />
    </div>
  );
}
