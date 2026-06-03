import type { FC } from "react";

export interface BudgetStatus {
  key: string;
  label: string;
}

interface BudgetStatusBadgeProps {
  status: BudgetStatus;
}

export const BudgetStatusBadge: FC<BudgetStatusBadgeProps> = ({ status }) => {
  let statusColor = "text-slate-400";

  if (status.key === "danger") statusColor = "text-red-400";
  else if (status.key === "warning") statusColor = "text-amber-300";
  else if (status.key === "ok") statusColor = "text-emerald-400";

  return <span className={statusColor}>{status.label}</span>;
};
