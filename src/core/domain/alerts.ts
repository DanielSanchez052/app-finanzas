import type { CoreState, Alert } from "./types";
import { getBudgetStatus, getSpentByCategory } from "./budgets";

export function calculateAlerts(state: CoreState): Alert[] {
  const alerts: Alert[] = [];

  const incomes = state.incomes.filter(i => i.month === state.currentMonth);
  const expenses = state.expenses.filter(e => e.month === state.currentMonth);

  const totalIncome = incomes.reduce((s, i) => s + (i.amount || 0), 0);
  const totalExpenses = expenses.reduce((s, e) => s + (e.amount || 0), 0);
  const savings = totalIncome - totalExpenses;

  if (savings < 0) {
    alerts.push({
      type: "danger",
      message: "Estás gastando más de lo que ingresas este mes."
    });
  }

  for (const budget of state.budgets) {
    const status = getBudgetStatus(state, budget.category);
    const spent = getSpentByCategory(state, budget.category);

    if (status.key === "danger") {
      alerts.push({
        type: "danger",
        message: `Has excedido el presupuesto de "${budget.category}" 
          (${spent.toFixed(0)}/${budget.amount.toFixed(0)}).
          `
      });
    } else if (status.key === "warning") {
      alerts.push({
        type: "warning",
        message: `Estás cerca de alcanzar el presupuesto de "${budget.category}".`
      });
    }
  }

  return alerts;
}

