import type { FC, FormEvent } from "react";

interface MovementFormShape {
  description: string;
  category: string;
  amount: string;
}

interface IncomeFormProps {
  form: MovementFormShape;
  submitting: boolean;
  onChangeField: (field: keyof MovementFormShape, value: string) => void;
  onSubmit: (e: FormEvent) => void;
}

export const IncomeForm: FC<IncomeFormProps> = ({
  form,
  submitting,
  onChangeField,
  onSubmit
}) => {
  return (
    <section className="bg-slate-900/60 border border-slate-800 rounded-lg p-4">
      <h2 className="text-lg font-semibold mb-1">Registrar ingreso</h2>
      <p className="text-xs text-slate-400 mb-4">
        Agrega un nuevo ingreso al mes actual.
      </p>

      <form className="space-y-3" onSubmit={onSubmit}>
        <div className="space-y-1">
          <label className="block text-xs text-slate-300">Descripción</label>
          <input
            type="text"
            value={form.description}
            onChange={e => onChangeField("description", e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-sm"
          />
        </div>

        <div className="space-y-1">
          <label className="block text-xs text-slate-300">Categoría</label>
          <input
            type="text"
            value={form.category}
            onChange={e => onChangeField("category", e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-sm"
          />
        </div>

        <div className="space-y-1">
          <label className="block text-xs text-slate-300">Monto</label>
          <input
            type="number"
            step="0.01"
            value={form.amount}
            onChange={e => onChangeField("amount", e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-sm"
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="mt-2 inline-flex items-center justify-center px-3 py-1.5 text-sm rounded bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 text-white"
        >
          {submitting ? "Guardando..." : "Guardar ingreso"}
        </button>
      </form>
    </section>
  );
};
