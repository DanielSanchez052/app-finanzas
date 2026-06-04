import type { CoreState, BudgetStatus, TopBudgetItem } from "./types";

export function getSpentByCategory(state: CoreState, category: string): number {
  return state.expenses
    .filter(e => e.category === category && e.month === state.currentMonth)
    .reduce((sum, e) => sum + (e.amount || 0), 0);
}

export function getBudgetForCategory(state: CoreState, category: string) {
  return state.budgets.find(b => b.category === category);
}

export function getBudgetStatus(state: CoreState, category: string): BudgetStatus {
  const budget = getBudgetForCategory(state, category);
  if (!budget) {
    return { key: "ok", label: "Sin presupuesto definido" };
  }

  const spent = getSpentByCategory(state, category);
  const ratio = budget.amount > 0 ? spent / budget.amount : 0;

  if (ratio >= 1) {
    return { key: "danger", label: "Presupuesto excedido" };
  }
  if (ratio >= 0.8) {
    return { key: "warning", label: "Cerca del límite" };
  }
  return { key: "ok", label: "Dentro del presupuesto" };
}

export function getTopBudgets(state: CoreState, limit = 4): TopBudgetItem[] {
  if (!state.budgets.length) return [];

  return state.budgets
    .map(b => {
      const spent = getSpentByCategory(state, b.category);
      const status = getBudgetStatus(state, b.category);
      return { category: b.category, amount: b.amount, spent, status };
    })
    .sort((a, b) => b.spent - a.spent)
    .slice(0, limit);
}

