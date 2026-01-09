import { state } from "../../core/state.js";
import { formatMoney } from "../../core/utils.js";

export function renderTransactionsTable(container) {
  const month = state.currentMonth;

  const expenses = state.expenses
    .filter(e => e.month === month)
    .map(e => ({
      type: "Gasto",
      date: e.date,
      category: e.category,
      desc: e.desc || "-",
      amount: -e.amount
    }));

  const incomes = state.incomes
    .filter(i => i.month === month)
    .map(i => ({
      type: "Ingreso",
      date: i.date,
      category: i.type,
      desc: "-",
      amount: i.amount
    }));

  const transactions = [...expenses, ...incomes]
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  container.innerHTML = `
    <h3>Transacciones del mes</h3>

    <div class="table-wrapper">
      <table class="transactions">
        <thead>
          <tr>
            <th>Fecha</th>
            <th>Tipo</th>
            <th>Categoría</th>
            <th>Descripción</th>
            <th>Monto</th>
          </tr>
        </thead>
        <tbody>
          ${transactions.length
      ? transactions.map(t => `
                <tr>
                  <td>${t.date}</td>
                  <td>${t.type}</td>
                  <td>${t.category}</td>
                  <td class="muted">${t.desc}</td>
                  <td class="${t.amount < 0 ? "danger" : "ok"}">
                    ${t.amount < 0 ? "-" : "+"}$${formatMoney(Math.abs(t.amount))}
                  </td>
                </tr>
              `).join("")
      : `<tr>
                  <td colspan="5" class="muted">
                    No hay transacciones este mes
                  </td>
                </tr>`
    }
        </tbody>
      </table>
    </div>
  `;
}
