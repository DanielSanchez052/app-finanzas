import type { FC } from "react";

interface NewBudgetCategoryFormProps {
  newCategory: string;
  newAmount: string;
  savingCategory: string | null;
  onChangeCategory: (value: string) => void;
  onChangeAmount: (value: string) => void;
  onAdd: () => void;
}

export const NewBudgetCategoryForm: FC<NewBudgetCategoryFormProps> = ({
  newCategory,
  newAmount,
  savingCategory,
  onChangeCategory,
  onChangeAmount,
  onAdd
}) => {
  return (
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
            onChange={e => onChangeCategory(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-sm"
          />
        </div>
        <div className="space-y-1">
          <label className="block text-xs text-slate-300">Presupuesto</label>
          <input
            type="number"
            step="0.01"
            value={newAmount}
            onChange={e => onChangeAmount(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-sm"
          />
        </div>
        <div>
          <button
            type="button"
            onClick={onAdd}
            disabled={!!savingCategory}
            className="inline-flex items-center justify-center px-3 py-1.5 text-sm rounded bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 text-white mt-4 md:mt-0"
          >
            Agregar
          </button>
        </div>
      </div>
    </section>
  );
};
