import { state } from "./state.js";

function download(filename, content, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();

  URL.revokeObjectURL(url);
}

export function exportJSON() {
  const data = {
    incomes: state.incomes,
    expenses: state.expenses,
    budgets: state.budgets
  };

  download(
    `backup-finanzas-${new Date().toISOString()}.json`,
    JSON.stringify(data, null, 2),
    "application/json"
  );
}

export function exportCSV(type) {
  const rows = state[type];
  if (!rows || !rows.length) return;

  const headers = Object.keys(rows[0]);
  const csv = [
    headers.join(","),
    ...rows.map(r =>
      headers.map(h => `"${r[h] ?? ""}"`).join(",")
    )
  ].join("\n");

  download(
    `${type}-${new Date().toISOString().slice(0, 10)}.csv`,
    csv,
    "text/csv"
  );
}

export function importJSON(file, onSuccess) {
  const reader = new FileReader();

  reader.onload = e => {
    try {
      const data = JSON.parse(e.target.result);
      if (!data.incomes || !data.expenses || !data.budgets) {
        throw new Error("Backup inválido");
      }

      onSuccess(data);
    } catch (err) {
      console.error(err);
      alert("Error al importar el backup");
    }
  };

  reader.readAsText(file);
}
