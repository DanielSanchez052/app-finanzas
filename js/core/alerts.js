import { state } from "./state.js";
import { getBudget, getSpentByCategory } from "./budgets.js";

export function calculateAlerts() {
  const alerts = [];

  const incomes = state.incomes.filter(i => i.month === state.currentMonth);
  const expenses = state.expenses.filter(e => e.month === state.currentMonth);

  const totalIncome = incomes.reduce((s, i) => s + i.amount, 0);
  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);

  // 1️⃣ Mes en rojo
  if (totalExpenses > totalIncome && totalIncome > 0) {
    alerts.push({
      type: "danger",
      message: "Estás gastando más de lo que ingresas este mes."
    });
  }

  // 2️⃣ Ahorro bajo
  const savings = totalIncome - totalExpenses;
  const minSavings = totalIncome * 0.1; // 10%

  if (totalIncome > 0 && savings < minSavings) {
    alerts.push({
      type: "warning",
      message: "Tu ahorro este mes es menor al 10% del ingreso."
    });
  }

  // 3️⃣ Presupuestos por categoría
  Object.keys(state.budgets).forEach(category => {
    const budget = getBudget(category);
    const spent = getSpentByCategory(category);

    if (!budget) return;

    if (spent > budget) {
      alerts.push({
        type: "danger",
        message: `Excediste el presupuesto de ${category}.`
      });
    } else if (spent > budget * 0.8) {
      alerts.push({
        type: "warning",
        message: `Estás cerca de exceder el presupuesto de ${category}.`
      });
    }
  });

  return alerts;
}
