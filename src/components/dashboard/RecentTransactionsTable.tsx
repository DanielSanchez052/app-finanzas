import type { FC } from "react";

interface RecentTransactionsTableProps {
  recentTransactions: any[];
}

export const RecentTransactionsTable: FC<RecentTransactionsTableProps> = ({
  recentTransactions
}) => {
  return (
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
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0
                    })}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
};
