import { state } from "../../core/state.js";
import { drawBarChart } from "./charts.js";
import { formatMoney } from "../../core/utils.js";

export function renderDashboard(container) {
  const incomes = state.incomes.filter(i => i.month === state.currentMonth);
  const expenses = state.expenses.filter(e => e.month === state.currentMonth);

  const totalIncome = incomes.reduce((s, i) => s + i.amount, 0);
  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);
  const balance = totalIncome - totalExpenses;

  // Agrupar gastos por categoría
  const categoryTotals = {};
  expenses.forEach(e => {
    categoryTotals[e.category] =
      (categoryTotals[e.category] || 0) + e.amount;
  });

  const categories = Object.keys(categoryTotals);
  const values = Object.values(categoryTotals);

  // HTML base
  container.innerHTML = `
    <h2>Dashboard</h2>

    <div class="kpis">
      <div class="kpi">Ingresos<br><b>$${formatMoney(totalIncome)}</b></div>
      <div class="kpi">Gastos<br><b>$${formatMoney(totalExpenses)}</b></div>
      <div class="kpi">Balance<br>
        <b style="color:${balance >= 0 ? "green" : "red"}">
          $${formatMoney(balance)}
        </b>
      </div>
    </div>

    <canvas id="expensesChart" width="600" height="250"></canvas>
    <canvas id="incomeVsExpenseChart" width="600" height="200"></canvas>
  `;

  // Dibujar gráficos
  drawBarChart(
    document.getElementById("expensesChart"),
    categories,
    values,
    "#555"
  );

  drawBarChart(
    document.getElementById("incomeVsExpenseChart"),
    ["Ingresos", "Gastos"],
    [totalIncome, totalExpenses],
    "#111"
  );
}
