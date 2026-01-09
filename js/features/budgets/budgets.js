import { state } from "../../core/state.js";
import { getBudget, getSpentByCategory, getBudgetStatus } from "../../core/budgets.js";
import { notify } from "../../core/events.js";
import { saveBudget } from "../../core/persistence/repository.js";

export function renderBudgets(container) {
  const categories = [...new Set(state.expenses.map(e => e.category))];

  container.innerHTML = `
    <h2>Presupuestos</h2>
    <table>
      <tr>
        <th>Categoría</th>
        <th>Presupuesto</th>
        <th>Gastado</th>
        <th>Estado</th>
      </tr>
      ${categories.map(cat => {
    const budget = getBudget(cat);
    const spent = getSpentByCategory(cat);
    const status = getBudgetStatus(cat);

    return `
          <tr class="${status.key}">
            <td>${cat}</td>
            <td>
              <input type="number" data-cat="${cat}" value="${budget || ""}" />
            </td>
            <td>$${spent.toLocaleString("es-CO")}</td>
            <td>${status.label}</td>
          </tr>
        `;
  }).join("")}
    </table>
  `;

  container.querySelectorAll("input").forEach(input => {
    input.addEventListener("change", e => {
      const cat = e.target.dataset.cat;
      state.budgets[cat] = Number(e.target.value);
      saveBudget({
        category: cat,
        amount: Number(e.target.value)
      })
      notify();
    });
  });
}
