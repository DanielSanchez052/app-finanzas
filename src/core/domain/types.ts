export type MovementType = "income" | "expense";

export interface Movement {
  id: string; // e.g. Date.now().toString()
  type: MovementType;
  description: string;
  category: string;
  amount: number; // always numeric in the domain
  month: string; // "YYYY-MM"
  createdAt: string; // ISO 8601
}

export interface Budget {
  category: string;
  amount: number;
}

export interface BudgetStatus {
  key: "ok" | "warning" | "danger";
  label: string;
}

export interface CoreState {
  incomes: Movement[];
  expenses: Movement[];
  budgets: Budget[];
  currentMonth: string; // "YYYY-MM"
}

export interface BackupData {
  incomes: Movement[];
  expenses: Movement[];
  budgets: Budget[];
}

export interface Alert {
  type: "danger" | "warning";
  message: string;
}

export interface TopBudgetItem {
  category: string;
  amount: number;
  spent: number;
  status: BudgetStatus;
}

export type CloudProviderId = "google-drive" | "s3";

export interface CloudProviderUser {
  email: string;
}

