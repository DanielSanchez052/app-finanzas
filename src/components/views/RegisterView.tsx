import type { FormEvent } from "react";
import { useMemo, useState } from "react";
import { useAppContext } from "../../context/AppContext";
import { IncomeForm } from "../register/IncomeForm";
import { ExpenseForm } from "../register/ExpenseForm";
import { MonthTransactionsTable } from "../register/MonthTransactionsTable";
import type { MonthTransactionRow } from "../register/MonthTransactionsTable";

type MovementType = "income" | "expense";

interface MovementFormState {
  type: MovementType;
  description: string;
  category: string;
  amount: string;
  date: string;
}

function createEmptyForm(type: MovementType): MovementFormState {
  return {
    type,
    description: "",
    category: "",
    amount: "",
    date: new Date().toISOString().slice(0, 10)
  };
}

export default function RegisterView() {
  const { state, actions } = useAppContext();

  const [incomeForm, setIncomeForm] = useState<MovementFormState>(createEmptyForm("income"));
  const [expenseForm, setExpenseForm] = useState<MovementFormState>(createEmptyForm("expense"));
  const [submitting, setSubmitting] = useState<MovementType | null>(null);
  const [showIncomeForm, setShowIncomeForm] = useState(true);
  const [showExpenseForm, setShowExpenseForm] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [editingMovement, setEditingMovement] = useState<{ id: string; type: MovementType } | null>(null);

  async function handleSubmit(
    e: FormEvent,
    form: MovementFormState,
    setForm: (f: MovementFormState) => void
  ) {
    e.preventDefault();

    const rawAmount = Number(form.amount.replace(",", "."));
    if (!form.description.trim() || !form.category.trim() || !rawAmount) {
      alert("Completa descripción, categoría y monto válido.");
      return;
    }

    const date = form.date || new Date().toISOString().slice(0, 10);
    const month = date.slice(0, 7);

    const isEditing = editingMovement && editingMovement.type === form.type;

    const baseExisting = isEditing
      ? (form.type === "income" ? state.incomes : state.expenses).find(
          (m: any) => String(m.id) === editingMovement!.id
        )
      : null;

    const movement: any = {
      ...(baseExisting || {}),
      id: String(baseExisting?.id ?? editingMovement?.id ?? Date.now()),
      type: form.type,
      description: form.description.trim(),
      category: form.category.trim(),
      amount: rawAmount,
      month,
      date,
      createdAt: baseExisting?.createdAt ?? new Date().toISOString()
    };

    try {
      setSubmitting(form.type);
      if (form.type === "income") {
        if (isEditing) {
          await (actions as any).updateIncome(movement);
        } else {
          await actions.addIncome(movement);
        }
      } else {
        if (isEditing) {
          await (actions as any).updateExpense(movement);
        } else {
          await actions.addExpense(movement);
        }
      }

      setForm(createEmptyForm(form.type));
      setEditingMovement(null);
    } catch (err) {
      console.error(err);
      alert("Error al guardar el movimiento. Revisa la consola para más detalles.");
    } finally {
      setSubmitting(null);
    }
  }

  async function handleDelete(tx: MonthTransactionRow) {
    const confirmed = window.confirm("¿Eliminar este movimiento? Esta acción no se puede deshacer.");
    if (!confirmed) return;

    try {
      if (tx.type === "income") {
        await (actions as any).deleteIncome(tx.id);
      } else {
        await (actions as any).deleteExpense(tx.id);
      }

      if (editingMovement && editingMovement.id === tx.id && editingMovement.type === tx.type) {
        handleCancelEdit(tx.type);
      }
    } catch (err) {
      console.error(err);
      alert("Error al eliminar el movimiento. Revisa la consola para más detalles.");
    }
  }

  function handleCancelEdit(type: MovementType) {
    setEditingMovement(null);
    if (type === "income") {
      setIncomeForm(createEmptyForm("income"));
    } else {
      setExpenseForm(createEmptyForm("expense"));
    }
  }

  const monthTransactions: MonthTransactionRow[] = useMemo(() => {
    const month = state.currentMonth;
    const incomes = (state.incomes || [])
      .filter((i: any) => i.month === month)
      .map((i: any) => ({
        id: String(i.id),
        type: "income" as const,
        description: i.description ?? "",
        category: i.category ?? "",
        amount: i.amount ?? 0,
        date: i.date || i.createdAt || ""
      }));

    const expenses = (state.expenses || [])
      .filter((e: any) => e.month === month)
      .map((e: any) => ({
        id: String(e.id),
        type: "expense" as const,
        description: e.description ?? "",
        category: e.category ?? "",
        amount: e.amount ?? 0,
        date: e.date || e.createdAt || ""
      }));

    return [...incomes, ...expenses].sort((a, b) => b.date.localeCompare(a.date));
  }, [state]);

  // console.log(monthTransactions);

  const availableCategories = useMemo(() => {
    const categories = new Set<string>();
    monthTransactions.forEach(tx => {
      if (tx.category) categories.add(tx.category);
    });
    return Array.from(categories).sort();
  }, [monthTransactions]);

  const filteredTransactions = useMemo(() => {
    if (selectedCategory === "all") return monthTransactions;
    return monthTransactions.filter(tx => tx.category === selectedCategory);
  }, [monthTransactions, selectedCategory]);

  const summary = useMemo(() => {
    const income = filteredTransactions
      .filter(tx => tx.type === "income")
      .reduce((sum, tx) => sum + (tx.amount || 0), 0);
    const expenses = filteredTransactions
      .filter(tx => tx.type === "expense")
      .reduce((sum, tx) => sum + (tx.amount || 0), 0);
    const balance = income - expenses;
    return { income, expenses, balance };
  }, [filteredTransactions]);

  function handleEdit(tx: MonthTransactionRow) {
    const date = tx.date || new Date().toISOString().slice(0, 10);
    const dateOnly = date.slice(0, 10);

    setEditingMovement({ id: tx.id, type: tx.type });

    if (tx.type === "income") {
      setShowIncomeForm(true);
      setIncomeForm(prev => ({
        ...prev,
        type: "income",
        description: tx.description,
        category: tx.category,
        amount: String(tx.amount),
        date: dateOnly
      }));
    } else {
      setShowExpenseForm(true);
      setExpenseForm(prev => ({
        ...prev,
        type: "expense",
        description: tx.description,
        category: tx.category,
        amount: String(tx.amount),
        date: dateOnly
      }));
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <section className="space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-100">
              Ingresos
            </h2>
            <button
              type="button"
              onClick={() => setShowIncomeForm(v => !v)}
              className="text-[11px] px-2 py-1 rounded border border-slate-600 text-slate-200 hover:bg-slate-800"
            >
              {showIncomeForm ? "Ocultar" : "Mostrar"}
            </button>
          </div>

          {showIncomeForm && (
            <IncomeForm
              form={incomeForm}
              submitting={submitting === "income"}
              onChangeField={(field, value) =>
                setIncomeForm(prev => ({ ...prev, [field]: value }))
              }
              onSubmit={e => handleSubmit(e, incomeForm, setIncomeForm)}
              isEditing={editingMovement?.type === "income"}
              onCancelEdit={() => handleCancelEdit("income")}
            />
          )}
        </section>

        <section className="space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-100">
              Gastos
            </h2>
            <button
              type="button"
              onClick={() => setShowExpenseForm(v => !v)}
              className="text-[11px] px-2 py-1 rounded border border-slate-600 text-slate-200 hover:bg-slate-800"
            >
              {showExpenseForm ? "Ocultar" : "Mostrar"}
            </button>
          </div>

          {showExpenseForm && (
            <ExpenseForm
              form={expenseForm}
              submitting={submitting === "expense"}
              onChangeField={(field, value) =>
                setExpenseForm(prev => ({ ...prev, [field]: value }))
              }
              onSubmit={e => handleSubmit(e, expenseForm, setExpenseForm)}
              isEditing={editingMovement?.type === "expense"}
              onCancelEdit={() => handleCancelEdit("expense")}
            />
          )}
        </section>
      </div>

      <section className="bg-slate-900/60 border border-slate-800 rounded-lg p-4 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold text-slate-100 mb-1">
              Movimientos del mes
            </h3>
            <p className="text-[11px] text-slate-400">
              Filtra por categoría para ver un resumen específico.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-300">Categoría:</span>
            <select
              className="bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs text-slate-100"
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
            >
              <option value="all">Todas</option>
              {availableCategories.map(cat => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 text-xs">
          <div className="bg-slate-950/60 border border-slate-800 rounded px-3 py-2">
            <div className="text-[11px] text-slate-400 mb-1">Ingresos</div>
            <div className="text-emerald-400 text-sm font-semibold">
              {summary.income.toLocaleString(undefined, {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
              })}
            </div>
          </div>

          <div className="bg-slate-950/60 border border-slate-800 rounded px-3 py-2">
            <div className="text-[11px] text-slate-400 mb-1">Gastos</div>
            <div className="text-red-400 text-sm font-semibold">
              {summary.expenses.toLocaleString(undefined, {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
              })}
            </div>
          </div>

          <div className="bg-slate-950/60 border border-slate-800 rounded px-3 py-2">
            <div className="text-[11px] text-slate-400 mb-1">Balance</div>
            <div
              className={`text-sm font-semibold ${
                summary.balance >= 0 ? "text-emerald-300" : "text-red-300"
              }`}
            >
              {summary.balance.toLocaleString(undefined, {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
              })}
            </div>
          </div>
        </div>

        <MonthTransactionsTable
          transactions={filteredTransactions}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </section>
    </div>
  );
}
