import type { FC } from "react";

export interface MonthlyTotalsPoint {
  month: string; // YYYY-MM
  income: number;
  expenses: number;
}

interface MonthlyIncomeExpensesChartProps {
  data: MonthlyTotalsPoint[];
}

export const MonthlyIncomeExpensesChart: FC<MonthlyIncomeExpensesChartProps> = ({
  data
}) => {
  if (!data.length) {
    return (
      <section className="bg-slate-900/60 border border-slate-800 rounded-lg p-4">
        <h3 className="text-sm font-semibold mb-1">Ingresos vs gastos por mes</h3>
        <p className="text-xs text-slate-400 mb-3">
          Aún no hay datos históricos suficientes para mostrar.
        </p>
      </section>
    );
  }

  const maxValue = Math.max(
    ...data.map(d => Math.max(d.income || 0, d.expenses || 0)),
    1
  );

  return (
    <section className="bg-slate-900/60 border border-slate-800 rounded-lg p-4">
      <h3 className="text-sm font-semibold mb-1">Ingresos vs gastos por mes</h3>
      <p className="text-xs text-slate-400 mb-3">
        Comparación mensual de tus ingresos y gastos.
      </p>

      <div className="space-y-2">
        {data.map(point => {
          const incomePct = (point.income / maxValue) * 100;
          const expensesPct = (point.expenses / maxValue) * 100;
          return (
            <div key={point.month} className="space-y-1 text-[11px]">
              <div className="flex items-center justify-between">
                <span className="text-slate-300">{point.month}</span>
                <span className="text-slate-500">
                  {point.income.toLocaleString()} / {point.expenses.toLocaleString()}
                </span>
              </div>
              <div className="h-4 bg-slate-950 rounded flex overflow-hidden border border-slate-800">
                <div
                  className="h-full bg-emerald-600/80"
                  style={{ width: `${incomePct}%` }}
                  title={`Ingresos: ${point.income.toLocaleString()}`}
                />
                <div
                  className="h-full bg-red-600/80"
                  style={{ width: `${expensesPct}%` }}
                  title={`Gastos: ${point.expenses.toLocaleString()}`}
                />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
