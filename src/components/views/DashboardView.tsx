import { useMemo } from "react";
import { useAppContext } from "../../context/AppContext";
import { calculateAlerts } from "../../core/domain/alerts";
import { getTopBudgets } from "../../core/domain/budgets";
import { MonthlySummary } from "../dashboard/MonthlySummary";
import { AlertsList } from "../dashboard/AlertsList";
import { TopBudgetsList } from "../dashboard/TopBudgetsList";
import { RecentTransactionsTable } from "../dashboard/RecentTransactionsTable";
import { MonthlyIncomeExpensesChart } from "../dashboard/MonthlyIncomeExpensesChart";
import { MonthlySavingsChart } from "../dashboard/MonthlySavingsChart";
import { CurrentMonthCategoryChart } from "../dashboard/CurrentMonthCategoryChart";

export default function DashboardView() {
  const { state } = useAppContext();

  const {
    totalIncome,
    totalExpenses,
    savings,
    alerts,
    recentTransactions,
    topBudgets,
    monthlyTotals,
    currentMonthCategories
  } = useMemo(() => {
    const incomesMonth = state.incomes.filter((i: any) => i.month === state.currentMonth);
    const expensesMonth = state.expenses.filter((e: any) => e.month === state.currentMonth);

    const totalIncome = incomesMonth.reduce((s: number, i: any) => s + (i.amount || 0), 0);
    const totalExpenses = expensesMonth.reduce((s: number, e: any) => s + (e.amount || 0), 0);
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

    // Serie histórica por mes
    const monthTotalsMap = new Map<string, { income: number; expenses: number }>();
    for (const i of state.incomes as any[]) {
      const key = i.month;
      if (!key) continue;
      const entry = monthTotalsMap.get(key) || { income: 0, expenses: 0 };
      entry.income += i.amount || 0;
      monthTotalsMap.set(key, entry);
    }
    for (const e of state.expenses as any[]) {
      const key = e.month;
      if (!key) continue;
      const entry = monthTotalsMap.get(key) || { income: 0, expenses: 0 };
      entry.expenses += e.amount || 0;
      monthTotalsMap.set(key, entry);
    }

    const monthlyTotals = Array.from(monthTotalsMap.entries())
      .map(([month, totals]) => ({ month, income: totals.income, expenses: totals.expenses }))
      .sort((a, b) => a.month.localeCompare(b.month));

    // Distribución por categoría del mes actual
    const currentMonthCategoriesMap = new Map<string, number>();
    for (const e of expensesMonth as any[]) {
      const cat = e.category || "(sin categoría)";
      const prev = currentMonthCategoriesMap.get(cat) || 0;
      currentMonthCategoriesMap.set(cat, prev + (e.amount || 0));
    }
    const currentMonthCategories = Array.from(currentMonthCategoriesMap.entries())
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount);

    return {
      totalIncome,
      totalExpenses,
      savings,
      alerts,
      recentTransactions,
      topBudgets,
      monthlyTotals,
      currentMonthCategories
    };
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
        <MonthlyIncomeExpensesChart data={monthlyTotals} />
        <MonthlySavingsChart data={monthlyTotals} />
      </section>

      <section className="grid gap-6 md:grid-cols-2">
        <AlertsList alerts={alerts} />
        <TopBudgetsList topBudgets={topBudgets} />
      </section>

      <CurrentMonthCategoryChart
        data={currentMonthCategories}
        month={state.currentMonth}
      />

      <RecentTransactionsTable recentTransactions={recentTransactions} />
    </div>
  );
}
