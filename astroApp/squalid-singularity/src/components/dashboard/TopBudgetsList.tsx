import type { FC } from "react";
import { BudgetStatusBadge } from "../budgets/BudgetStatusBadge";

interface TopBudgetItem {
  category: string;
  amount: number;
  spent: number;
  status?: { key: string; label: string };
}

interface TopBudgetsListProps {
  topBudgets: TopBudgetItem[];
}

export const TopBudgetsList: FC<TopBudgetsListProps> = ({ topBudgets }) => {
  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-4">
      <h3 className="text-sm font-semibold mb-1">Presupuestos más activos</h3>
      <p className="text-xs text-slate-400 mb-3">
        Categorías donde más estás gastando este mes.
      </p>

      {topBudgets.length === 0 ? (
        <div className="text-xs text-slate-400">
          Aún no tienes presupuestos definidos.
        </div>
      ) : (
        <ul className="space-y-2 text-xs">
          {topBudgets.map(b => (
            <li
              key={b.category}
              className="flex items-center justify-between gap-2 border border-slate-800 rounded px-3 py-2"
            >
              <div>
                <div className="text-slate-100 text-xs font-medium">
                  {b.category}
                </div>
                <div className="text-[11px] text-slate-400">
                  {b.spent.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  })}
                  {" / "}
                  {b.amount.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  })}
                </div>
              </div>
              <div className="text-[11px] font-medium">
                {b.status && <BudgetStatusBadge status={b.status} />}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
