import type { FC } from "react";

interface MonthlySummaryProps {
  currentMonth: string;
  totalIncome: number;
  totalExpenses: number;
  savings: number;
}

export const MonthlySummary: FC<MonthlySummaryProps> = ({
  currentMonth,
  totalIncome,
  totalExpenses,
  savings
}) => {
  return (
    <section className="bg-slate-900/60 border border-slate-800 rounded-lg p-4">
      <h2 className="text-lg font-semibold mb-1">Resumen rápido</h2>
      <p className="text-xs text-slate-400 mb-4">
        Visión general de tus finanzas del mes actual ({currentMonth}).
      </p>

      <div className="grid gap-4 md:grid-cols-3 text-sm">
        <div className="bg-slate-950/60 border border-slate-800 rounded p-3">
          <div className="text-xs text-slate-400 mb-1">Ingresos</div>
          <div className="text-emerald-400 text-lg font-semibold">
            {totalIncome.toLocaleString(undefined, {
              minimumFractionDigits: 0,
              maximumFractionDigits: 0
            })}
          </div>
        </div>
        <div className="bg-slate-950/60 border border-slate-800 rounded p-3">
          <div className="text-xs text-slate-400 mb-1">Gastos</div>
          <div className="text-red-400 text-lg font-semibold">
            {totalExpenses.toLocaleString(undefined, {
              minimumFractionDigits: 0,
              maximumFractionDigits: 0
            })}
          </div>
        </div>
        <div className="bg-slate-950/60 border border-slate-800 rounded p-3">
          <div className="text-xs text-slate-400 mb-1">Ahorro</div>
          <div
            className={`text-lg font-semibold ${
              savings >= 0 ? "text-emerald-300" : "text-red-300"
            }`}
          >
            {savings.toLocaleString(undefined, {
              minimumFractionDigits: 0,
              maximumFractionDigits: 0
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
