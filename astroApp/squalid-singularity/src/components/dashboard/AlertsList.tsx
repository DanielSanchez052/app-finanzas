import type { FC } from "react";

interface AlertsListProps {
  alerts: any[];
}

export const AlertsList: FC<AlertsListProps> = ({ alerts }) => {
  return (
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
  );
};
