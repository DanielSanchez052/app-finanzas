import type { FC, FormEvent } from "react";

interface MovementFormShape {
  description: string;
  category: string;
  amount: string;
  date: string;
}

interface IncomeFormProps {
  form: MovementFormShape;
  submitting: boolean;
  onChangeField: (field: keyof MovementFormShape, value: string) => void;
  onSubmit: (e: FormEvent) => void;
  isEditing?: boolean;
  onCancelEdit?: () => void;
}

export const IncomeForm: FC<IncomeFormProps> = ({
  form,
  submitting,
  onChangeField,
  onSubmit,
  isEditing,
  onCancelEdit
}) => {
  return (
    <section className="bg-slate-900/60 border border-slate-800 rounded-lg p-4">
      <h2 className="text-lg font-semibold mb-1">
        {isEditing ? "Editar ingreso" : "Registrar ingreso"}
      </h2>
      <p className="text-xs text-slate-400 mb-4">
        {isEditing
          ? "Modifica los datos del ingreso seleccionado y guarda los cambios."
          : "Agrega un nuevo ingreso al mes actual."}
      </p>

      <form className="space-y-3" onSubmit={onSubmit}>
        <div className="space-y-1">
          <label className="block text-xs text-slate-300" htmlFor="income-date">Fecha</label>
          <input
            type="date"
            id="income-date"
            value={form.date}
            onChange={e => onChangeField("date", e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-sm"
          />
        </div>

        <div className="space-y-1">
          <label className="block text-xs text-slate-300" htmlFor="income-description">Descripción</label>
          <input
            type="text"
            id="income-description"
            value={form.description}
            onChange={e => onChangeField("description", e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-sm"
          />
        </div>

        <div className="space-y-1">
          <label className="block text-xs text-slate-300" htmlFor="income-category">Categoría</label>
          <input
            type="text"
            id="income-category"
            value={form.category}
            onChange={e => onChangeField("category", e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-sm"
          />
        </div>

        <div className="space-y-1">
          <label className="block text-xs text-slate-300" htmlFor="income-amount">Monto</label>
          <input
            type="number"
            step="0.01"
            id="income-amount"
            value={form.amount}
            onChange={e => onChangeField("amount", e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-sm"
          />
          {form.amount && !Number.isNaN(Number(String(form.amount).replace(",", "."))) && (
            <p className="text-[10px] text-slate-400">
              Formateado: $
              {Number(String(form.amount).replace(",", ".")).toLocaleString("es-ES", {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
              })}
            </p>
          )}
        </div>

        <div className="mt-2 flex items-center gap-2">
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center justify-center px-3 py-1.5 text-sm rounded bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 text-white"
          >
            {submitting
              ? "Guardando..."
              : isEditing
              ? "Guardar cambios"
              : "Guardar ingreso"}
          </button>
          {isEditing && onCancelEdit && (
            <button
              type="button"
              onClick={onCancelEdit}
              className="inline-flex items-center justify-center px-3 py-1.5 text-sm rounded border border-slate-600 text-slate-200 hover:bg-slate-800"
            >
              Cancelar
            </button>
          )}
        </div>
      </form>
    </section>
  );
};
