import { useMemo, useState } from "react";
import { useAppContext } from "../../context/AppContext";
import { BudgetsTable } from "../budgets/BudgetsTable";
import type { EditableBudgetRow, BudgetRowWithStats } from "../budgets/BudgetsTable";
import { getSpentByCategory, getBudgetStatus } from "../../core/domain/budgets";
import { NewBudgetCategoryForm } from "../budgets/NewBudgetCategoryForm";

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

  const rowsWithStats: BudgetRowWithStats[] = useMemo(
    () =>
      rows.map(row => ({
        ...row,
        spent: getSpentByCategory(state as any, row.category),
        status: getBudgetStatus(state as any, row.category)
      })),
    [rows, state]
  );

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
        <BudgetsTable
          rows={rowsWithStats}
          savingCategory={savingCategory}
          onChangeRowAmount={(category, value) =>
            setRows(prev =>
              prev.map(r =>
                r.category === category ? { ...r, amount: value } : r
              )
            )
          }
          onSave={handleSave}
        />
      </section>

      <NewBudgetCategoryForm
        newCategory={newCategory}
        newAmount={newAmount}
        savingCategory={savingCategory}
        onChangeCategory={setNewCategory}
        onChangeAmount={setNewAmount}
        onAdd={handleAddCategory}
      />
    </div>
  );
}
