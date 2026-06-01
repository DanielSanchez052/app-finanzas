import { renderBudgets } from "../features/budgets/budgets.js";
import { renderCategorySummary } from "../features/analysis/categoriesSummary.js";
import { renderTransactionsTable } from "../features/analysis/transactionsTable.js";
import { renderAlerts } from "../features/alerts/alerts.js";
import { renderDashboard } from "../features/dashboard/dashboard.js";
import { renderSettings } from "../features/settings/index.js";
import { renderMonthSelector } from "../ui/monthSelector.js";

const budgetsContainer = document.getElementById("budgets");
const categorySummaryContainer = document.getElementById("category-summary");
const alertsContainer = document.getElementById("alerts");
const dashboardContainer = document.getElementById("dashboard");
const backupContainer = document.getElementById("settings");
const analysisTransactionsContainer = document.getElementById("analysis-transactions");


export function refresh() {
  renderBudgets(budgetsContainer);
  renderCategorySummary(categorySummaryContainer);
  renderTransactionsTable(analysisTransactionsContainer);
  renderAlerts(alertsContainer);
  renderDashboard(dashboardContainer);
  renderSettings(backupContainer)
  renderMonthSelector(document.getElementById("month-selector"));
}