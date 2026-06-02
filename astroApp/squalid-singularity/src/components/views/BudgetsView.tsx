import { useMemo, useState } from "react";
import { useAppContext } from "../../context/AppContext";
import {
  getSpentByCategory,
  getBudgetStatus
} from "../../core/budgets.js";

interface EditableBudgetRow {
  category: string;
  amount: string;
}

export default function BudgetsView() {
  const { state, actions } = useAppContext();

  const categories = useMemo(() => {
    const budgetCategories = Array.from(
      new Set(state.budgets.map((e: any) => e.category))
    );
    const expenseCategories = Array.from(
      new Set(state.expenses.map((e: any) => e.category).filter(Boolean))
    );
    return Array.from(new Set([...budgetCategories, ...expenseCategories])).sort();
  }, [state.budgets, state.expenses]);
  
  const [rows, setRows] = useState<EditableBudgetRow[]>(() =>
    (categories.length ? categories : ["General"]).map(category => ({
      category,
      amount: String(state.budgets?.find(b => b.category === category)?.amount ?? "")
    }))
  );

  const [newCategory, setNewCategory] = useState("");
  const [newAmount, setNewAmount] = useState("");
  const [savingCategory, setSavingCategory] = useState<string | null>(null);

  // Sincronizar filas cuando cambien las categorías o presupuestos
  useMemo(() => {
    setRows(
      (categories.length ? categories : ["General"]).map(category => ({
        category,
        amount: String(state.budgets?.find(b => b.category === category)?.amount ?? "")
      }))
    );
  }, [categories, state.budgets]);
  

  const handleSave = async (row: EditableBudgetRow) => {
    const amount = Number(row.amount.replace(",", "."));
    if (!row.category.trim() || !amount) {
      alert("Indica una categoría y un monto válido.");
      return;
    }

    try {
      setSavingCategory(row.category);
      await actions.saveBudget({ category: row.category.trim(), amount });
    } catch (err) {
      console.error(err);
      alert("Error al guardar el presupuesto.");
    } finally {
      setSavingCategory(null);
    }
  };

  const handleAddCategory = async () => {
    const category = newCategory.trim();
    const amount = Number(newAmount.replace(",", "."));
    if (!category || !amount) {
      alert("Indica una categoría y un monto válido para agregar.");
      return;
    }

    try {
      setSavingCategory(category);
      await actions.saveBudget({ category, amount });
      setNewCategory("");
      setNewAmount("");
    } catch (err) {
      console.error(err);
      alert("Error al guardar el presupuesto.");
    } finally {
      setSavingCategory(null);
    }
  };

  return (
    <div className="space-y-6">
      <section className="bg-slate-900/60 border border-slate-800 rounded-lg p-4">
        <h2 className="text-lg font-semibold mb-1">Presupuestos por categoría</h2>
        <p className="text-xs text-slate-400 mb-4">
          Define un monto máximo de gasto por categoría y revisa cuánto has gastado este mes.
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-300">
                <th className="text-left py-2 pr-3 font-medium">Categoría</th>
                <th className="text-right py-2 px-3 font-medium">Presupuesto</th>
                <th className="text-right py-2 px-3 font-medium">Gastado (mes actual)</th>
                <th className="text-left py-2 px-3 font-medium">Estado</th>
                <th className="py-2 px-3" />
              </tr>
            </thead>
            <tbody>
              {rows.map(row => {
                const spent = getSpentByCategory(row.category) || 0;
                const status = getBudgetStatus(row.category);

                let statusColor = "text-slate-400";
                if (status.key === "danger") statusColor = "text-red-400";
                else if (status.key === "warning") statusColor = "text-amber-300";
                else if (status.key === "ok") statusColor = "text-emerald-400";

                return (
                  <tr key={row.category} className="border-b border-slate-850 last:border-0">
                    <td className="py-2 pr-3 align-middle text-slate-100">
                      {row.category}
                    </td>
                    <td className="py-2 px-3 align-middle">
                      <input
                        type="number"
                        step="0.01"
                        value={row.amount}
                        onChange={e => {
                          const value = e.target.value;
                          setRows(prev =>
                            prev.map(r =>
                              r.category === row.category ? { ...r, amount: value } : r
                            )
                          );
                        }}
                        className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-right"
                      />
                    </td>
                    <td className="py-2 px-3 align-middle text-right text-slate-200">
                      {spent.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                      })}
                    </td>
                    <td className={`py-2 px-3 align-middle ${statusColor}`}>
                      {status.label}
                    </td>
                    <td className="py-2 px-3 align-middle text-right">
                      <button
                        type="button"
                        onClick={() => handleSave(row)}
                        disabled={savingCategory === row.category}
                        className="inline-flex items-center justify-center px-3 py-1 text-[11px] rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-60 text-slate-50"
                      >
                        {savingCategory === row.category ? "Guardando..." : "Guardar"}
                      </button>
                    </td>
                  </tr>
                );
              })}

              {rows.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="py-4 text-center text-xs text-slate-500"
                  >
                    Aún no tienes presupuestos definidos.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="bg-slate-900/60 border border-slate-800 rounded-lg p-4">
        <h3 className="text-sm font-semibold mb-1">Agregar nueva categoría</h3>
        <p className="text-xs text-slate-400 mb-3">
          Crea un presupuesto para una nueva categoría.
        </p>

        <div className="grid gap-3 md:grid-cols-[2fr,1fr,auto] items-end max-w-xl">
          <div className="space-y-1">
            <label className="block text-xs text-slate-300">Categoría</label>
            <input
              type="text"
              value={newCategory}
              onChange={e => setNewCategory(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-sm"
            />
          </div>
          <div className="space-y-1">
            <label className="block text-xs text-slate-300">Presupuesto</label>
            <input
              type="number"
              step="0.01"
              value={newAmount}
              onChange={e => setNewAmount(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-sm"
            />
          </div>
          <div>
            <button
              type="button"
              onClick={handleAddCategory}
              disabled={!!savingCategory}
              className="inline-flex items-center justify-center px-3 py-1.5 text-sm rounded bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 text-white mt-4 md:mt-0"
            >
              Agregar
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
