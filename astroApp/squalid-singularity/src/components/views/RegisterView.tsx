import type { FormEvent } from "react";
import { useState } from "react";
import { useAppContext } from "../../context/AppContext";
import { IncomeForm } from "../register/IncomeForm";
import { ExpenseForm } from "../register/ExpenseForm";

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

  async function handleSubmit(e: FormEvent, form: MovementFormState, setForm: (f: MovementFormState) => void) 
  {
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
    <IncomeForm
      form={incomeForm}
      submitting={submitting === "income"}
      onChangeField={(field, value) => setIncomeForm(prev => ({ ...prev, [field]: value })) }
      onSubmit={e => handleSubmit(e, incomeForm, setIncomeForm)}
    />

    <ExpenseForm
      form={expenseForm}
      submitting={submitting === "expense"}
      onChangeField={(field, value) => setExpenseForm(prev => ({ ...prev, [field]: value })) }
      onSubmit={e => handleSubmit(e, expenseForm, setExpenseForm)}
    />
  </div>
);
}
