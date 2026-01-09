import { state } from "../../core/state.js";
import { formatMoney } from "../../core/utils.js";

export function renderCategorySummary(container) {
  const expenses = state.expenses.filter(
    e => e.month === state.currentMonth
  );

  const incomes = state.incomes.filter(
    i => i.month === state.currentMonth
  );

  const totalIncome = incomes.reduce((sum, i) => sum + i.amount, 0);

  const totalsByCategory = {};

  expenses.forEach(e => {
    totalsByCategory[e.category] =
      (totalsByCategory[e.category] || 0) + e.amount;
  });

  const rows = Object.entries(totalsByCategory)
    .sort((a, b) => b[1] - a[1])
    .map(([category, amount]) => {
      const percent = totalIncome
        ? ((amount / totalIncome) * 100).toFixed(1)
        : 0;

      return `
        <tr>
          <td>${category}</td>
          <td>$${formatMoney(amount)}</td>
          <td>${percent}%</td>
        </tr>
      `;
    })
    .join("");

  container.innerHTML = `
    <h2>Resumen por categoría</h2>
    <table>
      <tr>
        <th>Categoría</th>
        <th>Gastado</th>
        <th>% del ingreso</th>
      </tr>
      ${rows || `<tr><td colspan="3">Sin gastos</td></tr>`}
    </table>
  `;
}
