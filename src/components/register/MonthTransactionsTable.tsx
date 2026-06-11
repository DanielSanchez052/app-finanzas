import type { FC } from "react";

export interface MonthTransactionRow {
  id: string;
  type: "income" | "expense";
  description: string;
  category: string;
  amount: number;
  date: string; // ISO string
}

interface MonthTransactionsTableProps {
  transactions: MonthTransactionRow[];
  onEdit?: (tx: MonthTransactionRow) => void;
  onDelete?: (tx: MonthTransactionRow) => void;
}

export const MonthTransactionsTable: FC<MonthTransactionsTableProps> = ({
  transactions,
  onEdit,
  onDelete
}) => {
  return (
    <section className="bg-slate-900/60 border border-slate-800 rounded-lg p-4 mt-6">
      <h3 className="text-sm font-semibold mb-1">Movimientos del mes</h3>
      <p className="text-xs text-slate-400 mb-3">
        Lista completa de ingresos y gastos del mes seleccionado.
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
              <th className="text-right py-2 px-3 font-medium">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {transactions.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="py-4 text-center text-xs text-slate-500"
                >
                  Aún no tienes movimientos registrados este mes.
                </td>
              </tr>
            )}

            {transactions.map(tx => {
              const formattedDate = tx.date ? tx.date.slice(0, 10) : "";
              const isIncome = tx.type === "income";

              return (
                <tr
                  key={tx.id}
                  className="border-b border-slate-850 last:border-0"
                >
                  <td className="py-2 pr-3 align-middle text-slate-200">
                    {formattedDate}
                  </td>
                  <td className="py-2 px-3 align-middle">
                    <span
                      className={
                        "inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium " +
                        (isIncome
                          ? "bg-emerald-900/50 text-emerald-300"
                          : "bg-red-900/50 text-red-300")
                      }
                    >
                      {isIncome ? "Ingreso" : "Gasto"}
                    </span>
                  </td>
                  <td className="py-2 px-3 align-middle text-slate-100">
                    {tx.description}
                  </td>
                  <td className="py-2 px-3 align-middle text-slate-200">
                    {tx.category}
                  </td>
                  <td className="py-2 px-3 align-middle text-right text-slate-100">
                    {tx.amount.toLocaleString(undefined, {
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0
                    })}
                  </td>
                  <td className="py-2 px-3 align-middle text-right text-slate-500 text-[11px]">
                    <div className="inline-flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => onEdit?.(tx)}
                        className="inline-flex items-center px-2 py-0.5 rounded border border-slate-600 text-slate-200 hover:bg-slate-800"
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete?.(tx)}
                        className="inline-flex items-center px-2 py-0.5 rounded border border-red-700 text-red-300 hover:bg-red-900/60"
                      >
                        Eliminar
                      </button>
                    </div>
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
