import { exportJSON, exportCSV, importJSON } from "../../core/export.js";
import { state } from "../../core/state.js";
import { addExpense, addIncome, saveBudget } from "../../core/persistence/repository.js"
import { notify } from "../../core/events.js";
import { clearDatabase } from "../../core/persistence/repository.js";


export function renderBackup(container) {
  container.innerHTML = `
    <h2>Backup & Exportación</h2>

    <button id="export-json">Backup completo (JSON)</button>
    <button id="export-incomes">Exportar ingresos (CSV)</button>
    <button id="export-expenses">Exportar gastos (CSV)</button>

    <button id="clear-db" class="danger">
      Limpiar datos locales
    </button>

    <div style="margin-top:10px">
      <input type="file" id="import-json" accept=".json" />
    </div>
  `;

  document.getElementById("export-json").onclick = exportJSON;
  document.getElementById("export-incomes").onclick = () => exportCSV("incomes");
  document.getElementById("export-expenses").onclick = () => exportCSV("expenses");

  document.getElementById("import-json").onchange = e => {
    const file = e.target.files[0];
    if (!file) return;

    importJSON(file, data => {
      state.incomes = data.incomes;
      state.expenses = data.expenses;
      state.budgets = data.budgets;

      data.incomes.forEach(income => {
        addIncome(income)
      });

      data.expenses.forEach(expense => {
        addExpense(expense)
      });

      Object.entries(data.budgets).forEach(([key, value]) => {
        saveBudget({
          category: key,
          amount: Number(value)
        })
      });

      notify();
      alert("Backup restaurado correctamente");
    });
  };

  document.getElementById("clear-db").onclick = async () => {
    const confirm1 = confirm(
      "Esto eliminará TODOS los datos locales de la app.\n\n¿Deseas continuar?"
    );

    if (!confirm1) return;

    const confirm2 = confirm(
      "Última confirmación.\nEsta acción NO se puede deshacer."
    );

    if (!confirm2) return;

    await clearDatabase();

    // Limpiar estado en memoria
    state.incomes = [];
    state.expenses = [];
    state.budgets = {};

    notify();
    alert("Base de datos local limpiada correctamente.");
  };
}
