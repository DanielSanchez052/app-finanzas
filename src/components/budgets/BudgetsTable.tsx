import type { FC } from "react";
import type { BudgetStatus } from "../../core/domain/types";
import { BudgetStatusBadge } from "./BudgetStatusBadge";

export interface EditableBudgetRow {
  category: string;
  amount: string;
}

export interface BudgetRowWithStats extends EditableBudgetRow {
  spent: number;
  status: BudgetStatus;
}

interface BudgetsTableProps {
  rows: BudgetRowWithStats[];
  savingCategory: string | null;
  onChangeRowAmount: (category: string, value: string) => void;
  onSave: (row: EditableBudgetRow) => void;
}

export const BudgetsTable: FC<BudgetsTableProps> = ({
  rows,
  savingCategory,
  onChangeRowAmount,
  onSave
}) => {
  return (
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
                    onChange={e => onChangeRowAmount(row.category, e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-right"
                  />
                </td>
                <td className="py-2 px-3 align-middle text-right text-slate-200">
                  {row.spent.toLocaleString(undefined, {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0
                  })}
                </td>
                <td className="py-2 px-3 align-middle">
                  <BudgetStatusBadge status={row.status} />
                </td>
                <td className="py-2 px-3 align-middle text-right">
                  <button
                    type="button"
                    onClick={() => onSave(row)}
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
  );
};
