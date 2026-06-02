import { state } from "../state.js";
import json from "./json.js";
import csv from "./csv.js";

import { addExpense, addIncome, saveBudget } from "../persistence/repository.js";

const backupProviders = {
  "json": json,
  "csv": csv
};

function download(filename, content, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();

  URL.revokeObjectURL(url);
}

export default {
  providers: Object.keys(backupProviders),
  exportData(format, section = 'all') {
      const provider = backupProviders[format];
      if (!provider) {
        throw new Error(`Formato no soportado: ${format}`);
      }
  
      const data = {
        incomes: section === 'all' || section === 'incomes' ? state.incomes : [],
        expenses: section === 'all' || section === 'expenses' ? state.expenses : [],
        budgets: section === 'all' || section === 'budgets' ? state.budgets : []
      };

      const content = provider.export(data);
      return {
        content,
        type: provider.type,
        format,
        download: () => download(`backup-finanzas-${new Date().toISOString()}.${format}`, content, provider.type)
      }
    },
    importData(file, format, section = 'all') {
      const provider = backupProviders[format];
      if (!provider) {
        throw new Error(`Formato no soportado: ${format}`);
      }
      
      provider.import(file, data => {
        if (section === 'all' || section === 'incomes' && data.incomes.length > 0) {
          state.incomes = data.incomes || [];
          data.incomes.forEach(income => addIncome(income));
        }
        if (section === 'all' || section === 'expenses' && data.expenses.length > 0) {
          state.expenses = data.expenses || [];
          data.expenses.forEach(expense => addExpense(expense));
        }
        if (section === 'all' || section === 'budgets' && data.budgets.length > 0) {
          state.budgets = data.budgets || [];
          Object.entries(data.budgets).forEach(([key, value]) => {
            saveBudget({
              category: key,
              amount: Number(value),
            });
          });
        }
      });
    }
}
