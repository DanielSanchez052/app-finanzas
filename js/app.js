import { state } from "./core/state.js";

import { initRepository } from "./core/persistence/repository.js";
import { getIncomes, getExpenses, getBudgets } from "./core/persistence/repository.js";

import { initIncomes } from "./features/incomes/incomes.js";
import { initExpenses } from "./features/expenses/expenses.js";
import { renderMonthSelector } from "./ui/monthSelector.js";
import { renderBudgets } from "./features/budgets/budgets.js";
import { renderCategorySummary } from "./features/analysis/categoriesSummary.js";
import { renderTransactionsTable } from "./features/analysis/transactionsTable.js";
import { renderAlerts } from "./features/alerts/alerts.js";
import { renderDashboard } from "./features/dashboard/dashboard.js";
import { renderBackup } from "./features/backup/backup.js";
import { initTabs } from "./ui/tabs.js";

import { subscribe } from "./core/events.js";


async function bootstrap() {
  await initRepository();

  state.incomes = await getIncomes();
  state.expenses = await getExpenses();

  const budgetsArray = await getBudgets();

  state.budgets = Object.fromEntries(
    budgetsArray.map(b => [b.category, b.amount])
  );

  refresh();
}

initIncomes(document.getElementById("income-form"));
initExpenses(document.getElementById("expense-form"));
initTabs();

const budgetsContainer = document.getElementById("budgets");
const categorySummaryContainer = document.getElementById("category-summary");
const alertsContainer = document.getElementById("alerts");
const dashboardContainer = document.getElementById("dashboard");
const backupContainer = document.getElementById("backup");
const analysisTransactionsContainer = document.getElementById("analysis-transactions");

function refresh() {
  renderBudgets(budgetsContainer);
  renderCategorySummary(categorySummaryContainer);
  renderTransactionsTable(analysisTransactionsContainer);
  renderAlerts(alertsContainer);
  renderDashboard(dashboardContainer);
  renderBackup(backupContainer);
}

renderMonthSelector(document.getElementById("month-selector"));


// Suscribimos el render al sistema de eventos
subscribe(refresh);

bootstrap();

