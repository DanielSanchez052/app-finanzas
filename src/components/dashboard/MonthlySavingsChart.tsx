import type { FC } from "react";
import type { MonthlyTotalsPoint } from "./MonthlyIncomeExpensesChart";

interface MonthlySavingsChartProps {
  data: MonthlyTotalsPoint[];
}

export const MonthlySavingsChart: FC<MonthlySavingsChartProps> = ({ data }) => {
  if (!data.length) {
    return (
      <section className="bg-slate-900/60 border border-slate-800 rounded-lg p-4">
        <h3 className="text-sm font-semibold mb-1">Ahorro mensual</h3>
        <p className="text-xs text-slate-400 mb-3">
          Aún no hay datos históricos suficientes para mostrar.
        </p>
      </section>
    );
  }

  const points = data.map(d => ({
    month: d.month,
    savings: d.income - d.expenses
  }));

  const maxAbs = Math.max(...points.map(p => Math.abs(p.savings) || 0), 1);

  return (
    <section className="bg-slate-900/60 border border-slate-800 rounded-lg p-4">
      <h3 className="text-sm font-semibold mb-1">Ahorro mensual</h3>
      <p className="text-xs text-slate-400 mb-3">
        Diferencia entre ingresos y gastos cada mes.
      </p>

      <div className="space-y-2">
        {points.map(point => {
          const pct = (Math.abs(point.savings) / maxAbs) * 100;
          const positive = point.savings >= 0;
          return (
            <div key={point.month} className="space-y-1 text-[11px]">
              <div className="flex items-center justify-between">
                <span className="text-slate-300">{point.month}</span>
                <span className={positive ? "text-emerald-400" : "text-red-400"}>
                  {point.savings.toLocaleString()}
                </span>
              </div>
              <div className="h-3 bg-slate-950 rounded border border-slate-800 overflow-hidden">
                <div
                  className={
                    "h-full " +
                    (positive ? "bg-emerald-600/80" : "bg-red-600/80")
                  }
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
