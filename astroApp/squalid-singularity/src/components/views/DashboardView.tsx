import { useMemo } from "react";
import { useAppContext } from "../../context/AppContext";
import { calculateAlerts } from "../../core/alerts.js";
import { getBudgetStatus, getSpentByCategory } from "../../core/budgets.js";

export default function DashboardView() {
  const { state } = useAppContext();

  const { totalIncome, totalExpenses, savings, alerts, recentTransactions, topBudgets } =
    useMemo(() => {
      const incomesMonth = state.incomes.filter((i: any) => i.month === state.currentMonth);
      const expensesMonth = state.expenses.filter((e: any) => e.month === state.currentMonth);

      const totalIncome = incomesMonth.reduce(
        (s: number, i: any) => s + (i.amount || 0),
        0
      );
      const totalExpenses = expensesMonth.reduce(
        (s: number, e: any) => s + (e.amount || 0),
        0
      );
      const savings = totalIncome - totalExpenses;

      const alerts = calculateAlerts();

      const recentTransactions = [...incomesMonth, ...expensesMonth]
        .map((t: any) => ({
          ...t,
          kind: t.amount >= 0 && state.incomes.includes(t) ? "income" : "expense"
        }))
        .sort((a, b) => {
          const da = a.createdAt || a.date || "";
          const db = b.createdAt || b.date || "";
          return db.localeCompare(da);
        })
        .slice(0, 5);

    
    const topBudgets = 
    state.budgets?.length > 0
      ? (state.budgets
        .map((b: any) => {
          const spent = getSpentByCategory(b.category) || 0;
          const status = getBudgetStatus(b.category);
          return { ...b, spent, status };
        })
        .sort((a, b) => b.spent - a.spent)
        .slice(0, 4))
      : [];
      
      return { totalIncome, totalExpenses, savings, alerts, recentTransactions, topBudgets };
    }, [state]);

  return (
    <div className="space-y-6">
      <section className="bg-slate-900/60 border border-slate-800 rounded-lg p-4">
        <h2 className="text-lg font-semibold mb-1">Resumen rápido</h2>
        <p className="text-xs text-slate-400 mb-4">
          Visión general de tus finanzas del mes actual ({state.currentMonth}).
        </p>

        <div className="grid gap-4 md:grid-cols-3 text-sm">
          <div className="bg-slate-950/60 border border-slate-800 rounded p-3">
            <div className="text-xs text-slate-400 mb-1">Ingresos</div>
            <div className="text-emerald-400 text-lg font-semibold">
              {totalIncome.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              })}
            </div>
          </div>
          <div className="bg-slate-950/60 border border-slate-800 rounded p-3">
            <div className="text-xs text-slate-400 mb-1">Gastos</div>
            <div className="text-red-400 text-lg font-semibold">
              {totalExpenses.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
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
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-2">
        <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-4">
          <h3 className="text-sm font-semibold mb-1">Alertas principales</h3>
          <p className="text-xs text-slate-400 mb-3">
            Lo más importante que deberías revisar ahora mismo.
          </p>

          {alerts.length === 0 ? (
            <div className="text-xs text-emerald-400">
              No hay alertas por el momento.
            </div>
          ) : (
            <ul className="space-y-2 text-xs">
              {alerts.slice(0, 3).map((a: any, idx: number) => (
                <li
                  key={idx}
                  className={`px-3 py-2 rounded border text-xs ${
                    a.type === "danger"
                      ? "border-red-700 bg-red-950/40 text-red-200"
                      : "border-amber-700 bg-amber-950/40 text-amber-100"
                  }`}
                >
                  {a.message}
                </li>
              ))}
            </ul>
          )}
        </div>

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
              {topBudgets.map((b: any) => {
                let statusColor = "text-slate-400";
                if (b.status?.key === "danger") statusColor = "text-red-400";
                else if (b.status?.key === "warning") statusColor = "text-amber-300";
                else if (b.status?.key === "ok") statusColor = "text-emerald-400";

                return (
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
                        })}{" "}
                        {b.amount.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2
                        })}
                      </div>
                    </div>
                    <div className={`text-[11px] font-medium ${statusColor}`}>
                      {b.status?.label}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </section>

      <section className="bg-slate-900/60 border border-slate-800 rounded-lg p-4">
        <h3 className="text-sm font-semibold mb-1">Últimos movimientos</h3>
        <p className="text-xs text-slate-400 mb-3">
          Los 5 movimientos más recientes del mes actual.
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-300">
                <th className="text-left py-2 pr-3 font-medium">Fecha</th>
                <th className="text-left py-2 px-3 font-medium">Tipo</th>
                <th className="text-left py-2 px-3 font-medium">Descripción</th>
                <th className="text-left py-2 px-3 font-medium">Categoría</th>
                <th className="text-right py-2 px-3 font-medium">Monto</th>
              </tr>
            </thead>
            <tbody>
              {recentTransactions.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="py-4 text-center text-xs text-slate-500"
                  >
                    Aún no tienes movimientos registrados este mes.
                  </td>
                </tr>
              )}

              {recentTransactions.map((t: any, idx: number) => {
                const amount = t.amount || 0;
                const date = t.createdAt || t.date || "";
                const formattedDate = date ? date.slice(0, 10) : "";
                const isIncome = t.kind === "income";

                return (
                  <tr
                    key={`${t.id ?? idx}-${t.kind}-${idx}`}
                    className="border-b border-slate-850 last:border-0"
                  >
                    <td className="py-2 pr-3 align-middle text-slate-200">
                      {formattedDate}
                    </td>
                    <td className="py-2 px-3 align-middle">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium ${
                          isIncome
                            ? "bg-emerald-900/60 text-emerald-300"
                            : "bg-red-900/60 text-red-300"
                        }`}
                      >
                        {isIncome ? "Ingreso" : "Gasto"}
                      </span>
                    </td>
                    <td className="py-2 px-3 align-middle text-slate-100">
                      {t.description || "(sin descripción)"}
                    </td>
                    <td className="py-2 px-3 align-middle text-slate-200">
                      {t.category || "-"}
                    </td>
                    <td
                      className={`py-2 px-3 align-middle text-right ${
                        isIncome ? "text-emerald-300" : "text-red-300"
                      }`}
                    >
                      {amount.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                      })}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
