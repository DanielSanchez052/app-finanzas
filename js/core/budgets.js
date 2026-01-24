import { state } from "./state.js";

export function getBudget(category) {
  return state.budgets[category] || 0;
}

export function getSpentByCategory(category) {
  return state.expenses
    .filter(e => e.month === state.currentMonth && e.category === category)
    .reduce((sum, e) => sum + e.amount, 0);
}

export function getBudgetTotal() {
  return Object.values(state.budgets).reduce((sum, e) => sum + e, 0)
}

export function getBudgetStatus(category) {
  const budget = getBudget(category);
  const spent = getSpentByCategory(category);

  if (!budget) return { key: "none", label: "Sin presupuesto" };
  if (spent > budget) return { key: "danger", label: "Excedido" };
  if (spent > budget * 0.8) return { key: "warning", label: "!Cuidado!" };
  return { key: "ok", label: "Ok" };
}
