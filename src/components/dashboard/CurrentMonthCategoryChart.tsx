import type { FC } from "react";

export interface CategoryAmountPoint {
  category: string;
  amount: number;
}

interface CurrentMonthCategoryChartProps {
  data: CategoryAmountPoint[];
  month: string;
}

export const CurrentMonthCategoryChart: FC<CurrentMonthCategoryChartProps> = ({
  data,
  month
}) => {
  if (!data.length) {
    return (
      <section className="bg-slate-900/60 border border-slate-800 rounded-lg p-4">
        <h3 className="text-sm font-semibold mb-1">Gasto por categoría</h3>
        <p className="text-xs text-slate-400 mb-1">
          Aún no hay gastos registrados en este mes ({month}).
        </p>
      </section>
    );
  }

  const maxValue = Math.max(...data.map(d => d.amount || 0), 1);

  return (
    <section className="bg-slate-900/60 border border-slate-800 rounded-lg p-4">
      <h3 className="text-sm font-semibold mb-1">Gasto por categoría</h3>
      <p className="text-xs text-slate-400 mb-3">
        Distribución de tus gastos en el mes actual ({month}).
      </p>

      <div className="space-y-2 text-[11px]">
        {data.map(point => {
          const pct = (point.amount / maxValue) * 100;
          return (
            <div key={point.category} className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-slate-300">{point.category}</span>
                <span className="text-slate-400">
                  {point.amount.toLocaleString()}
                </span>
              </div>
              <div className="h-3 bg-slate-950 rounded border border-slate-800 overflow-hidden">
                <div
                  className="h-full bg-sky-600/80"
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
