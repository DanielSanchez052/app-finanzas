import type { FormEvent } from "react";
import { useState } from "react";
import { useAppContext } from "../../context/AppContext";

type MovementType = "income" | "expense";

interface MovementFormState {
  type: MovementType;
  description: string;
  category: string;
  amount: string;
}

function createEmptyForm(type: MovementType): MovementFormState {
  return {
    type,
    description: "",
    category: "",
    amount: ""
  };
}

export default function RegisterView() {
  const { actions } = useAppContext();

  const [incomeForm, setIncomeForm] = useState<MovementFormState>(
    createEmptyForm("income")
  );
  const [expenseForm, setExpenseForm] = useState<MovementFormState>(
    createEmptyForm("expense")
  );
  const [submitting, setSubmitting] = useState<MovementType | null>(null);

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

    const movement = {
      id: Date.now(),
      description: form.description.trim(),
      category: form.category.trim(),
      amount: rawAmount,
      month: new Date().toISOString().slice(0, 7),
      createdAt: new Date().toISOString()
    };

    try {
      setSubmitting(form.type);
      if (form.type === "income") {
        await actions.addIncome(movement);
      } else {
        await actions.addExpense(movement);
      }
      setForm(createEmptyForm(form.type));
    } catch (err) {
      console.error(err);
      alert("Error al guardar el movimiento. Revisa la consola para más detalles.");
    } finally {
      setSubmitting(null);
    }
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <section className="bg-slate-900/60 border border-slate-800 rounded-lg p-4">
        <h2 className="text-lg font-semibold mb-1">Registrar ingreso</h2>
        <p className="text-xs text-slate-400 mb-4">
          Agrega un nuevo ingreso al mes actual.
        </p>

        <form
          className="space-y-3"
          onSubmit={e => handleSubmit(e, incomeForm, setIncomeForm)}
        >
          <div className="space-y-1">
            <label className="block text-xs text-slate-300">Descripción</label>
            <input
              type="text"
              value={incomeForm.description}
              onChange={e =>
                setIncomeForm({ ...incomeForm, description: e.target.value })
              }
              className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-sm"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs text-slate-300">Categoría</label>
            <input
              type="text"
              value={incomeForm.category}
              onChange={e =>
                setIncomeForm({ ...incomeForm, category: e.target.value })
              }
              className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-sm"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs text-slate-300">Monto</label>
            <input
              type="number"
              step="0.01"
              value={incomeForm.amount}
              onChange={e =>
                setIncomeForm({ ...incomeForm, amount: e.target.value })
              }
              className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-sm"
            />
          </div>

          <button
            type="submit"
            disabled={submitting === "income"}
            className="mt-2 inline-flex items-center justify-center px-3 py-1.5 text-sm rounded bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 text-white"
          >
            {submitting === "income" ? "Guardando..." : "Guardar ingreso"}
          </button>
        </form>
      </section>

      <section className="bg-slate-900/60 border border-slate-800 rounded-lg p-4">
        <h2 className="text-lg font-semibold mb-1">Registrar gasto</h2>
        <p className="text-xs text-slate-400 mb-4">
          Agrega un nuevo gasto al mes actual.
        </p>

        <form
          className="space-y-3"
          onSubmit={e => handleSubmit(e, expenseForm, setExpenseForm)}
        >
          <div className="space-y-1">
            <label className="block text-xs text-slate-300">Descripción</label>
            <input
              type="text"
              value={expenseForm.description}
              onChange={e =>
                setExpenseForm({ ...expenseForm, description: e.target.value })
              }
              className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-sm"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs text-slate-300">Categoría</label>
            <input
              type="text"
              value={expenseForm.category}
              onChange={e =>
                setExpenseForm({ ...expenseForm, category: e.target.value })
              }
              className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-sm"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs text-slate-300">Monto</label>
            <input
              type="number"
              step="0.01"
              value={expenseForm.amount}
              onChange={e =>
                setExpenseForm({ ...expenseForm, amount: e.target.value })
              }
              className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-sm"
            />
          </div>

          <button
            type="submit"
            disabled={submitting === "expense"}
            className="mt-2 inline-flex items-center justify-center px-3 py-1.5 text-sm rounded bg-red-600 hover:bg-red-500 disabled:opacity-60 text-white"
          >
            {submitting === "expense" ? "Guardando..." : "Guardar gasto"}
          </button>
        </form>
      </section>
    </div>
  );
}
