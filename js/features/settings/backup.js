import { exportJSON, exportCSV, importJSON } from "../../core/export.js";
import { state } from "../../core/state.js";
import {
  addExpense,
  addIncome,
  saveBudget,
} from "../../core/persistence/repository.js";
import { notify } from "../../core/events.js";
import { clearDatabase } from "../../core/persistence/repository.js";
import cloud from "../../core/persistence/cloud/index.js";

export function renderBackup(container) {
  container.innerHTML = `
  <h2>Backup & Exportación</h2>
 
  <div class="settings-backup-row">
    <section class="settings-section">
      <h3>Backup local</h3>
      <p style="font-size:0.9em; color:#aaa;">
        Guarda y restaura tus datos manualmente en tu dispositivo.
      </p>
 
      <div class="settings-group">
        <button id="export-json">Descargar backup completo (JSON)</button>
      </div>
 
      <div class="settings-group">
        <button id="export-incomes">Exportar ingresos (CSV)</button>
        <button id="export-expenses">Exportar gastos (CSV)</button>
      </div>
 
      <div class="settings-group" style="margin-top:8px;">
        <label for="import-json" style="font-size:0.9em;">Restaurar desde archivo JSON:</label>
        <input type="file" id="import-json" accept=".json" />
      </div>
    </section>
 
    <section class="settings-section">
      <h3>Backup en la nube</h3>
      <p style="font-size:0.9em; color:#aaa;">
        Usa el proveedor configurado en la sección de Persistencia de Datos.
      </p>
 
      <div class="settings-group">
        <button id="backup-cloud-save">Guardar backup en la nube</button>
        <button id="backup-cloud-load">Restaurar desde la nube</button>
      </div>
    </section>
  </div>
 
  <section class="settings-section">
    <h3>Zona de peligro</h3>
    <p style="font-size:0.9em; color:#f88;">
      Esta acción elimina todos los datos locales de la app. No se puede deshacer.
    </p>
 
    <div class="settings-group">
      <button id="clear-db" class="danger">
        Limpiar datos locales
      </button>
    </div>
  </section>
`;
  document.getElementById("export-json").onclick = exportJSON;
  document.getElementById("export-incomes").onclick = () =>
    exportCSV("incomes");
  document.getElementById("export-expenses").onclick = () =>
    exportCSV("expenses");

  document.getElementById("import-json").onchange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    importJSON(file, (data) => {
      state.incomes = data.incomes;
      state.expenses = data.expenses;
      state.budgets = data.budgets;

      data.incomes.forEach((income) => {
        addIncome(income);
      });

      data.expenses.forEach((expense) => {
        addExpense(expense);
      });

      Object.entries(data.budgets).forEach(([key, value]) => {
        saveBudget({
          category: key,
          amount: Number(value),
        });
      });

      notify();
      alert("Backup restaurado correctamente");
    });
  };

  const applyBackupData = (data) => {
    state.incomes = data.incomes;
    state.expenses = data.expenses;
    state.budgets = data.budgets;

    data.incomes.forEach((income) => {
      addIncome(income);
    });

    data.expenses.forEach((expense) => {
      addExpense(expense);
    });

    Object.entries(data.budgets).forEach(([key, value]) => {
      saveBudget({
        category: key,
        amount: Number(value),
      });
    });

    notify();
  };

  document.getElementById("backup-cloud-save").onclick = async () => {
    const provider = localStorage.getItem("storageProvider");
    if (!provider) {
      alert(
        "Primero selecciona y configura un proveedor de almacenamiento en la sección de Persistencia de Datos."
      );
      return;
    }

    const data = {
      incomes: state.incomes,
      expenses: state.expenses,
      budgets: state.budgets,
    };

    try {
      await cloud.saveOnCloud(provider, data);
      alert("Backup guardado en la nube correctamente.");
    } catch (err) {
      console.error(err);
      alert("Error al guardar el backup en la nube.");
    }
  };

  document.getElementById("backup-cloud-load").onclick = async () => {
    const provider = localStorage.getItem("storageProvider");
    if (!provider) {
      alert(
        "Primero selecciona y configura un proveedor de almacenamiento en la sección de Persistencia de Datos."
      );
      return;
    }

    try {
      const data = await cloud.loadFromCloud(provider);
      if (!data || !data.incomes || !data.expenses || !data.budgets) {
        alert("Backup remoto inválido o incompleto.");
        return;
      }

      applyBackupData(data);
      alert("Backup restaurado desde la nube correctamente.");
    } catch (err) {
      console.error(err);
      alert("Error al restaurar el backup desde la nube.");
    }
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
