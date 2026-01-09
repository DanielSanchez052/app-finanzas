import { renderBudgets } from "../features/budgets/budgets.js";
import { renderCategorySummary } from "../features/analysis/categoriesSummary.js";
import { renderTransactionsTable } from "../features/analysis/transactionsTable.js";
import { renderAlerts } from "../features/alerts/alerts.js";
import { renderDashboard } from "../features/dashboard/dashboard.js";
import { renderBackup } from "../features/backup/backup.js";
import { renderMonthSelector } from "../ui/monthSelector.js";

const budgetsContainer = document.getElementById("budgets");
const categorySummaryContainer = document.getElementById("category-summary");
const alertsContainer = document.getElementById("alerts");
const dashboardContainer = document.getElementById("dashboard");
const backupContainer = document.getElementById("backup");
const analysisTransactionsContainer = document.getElementById("analysis-transactions");

export function refresh() {
  renderBudgets(budgetsContainer);
  renderCategorySummary(categorySummaryContainer);
  renderTransactionsTable(analysisTransactionsContainer);
  renderAlerts(alertsContainer);
  renderDashboard(dashboardContainer);
  renderBackup(backupContainer);
  renderMonthSelector(document.getElementById("month-selector"));
}