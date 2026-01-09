import { state } from "./core/state.js";

import { initRepository } from "./core/persistence/repository.js";
import { getIncomes, getExpenses, getBudgets } from "./core/persistence/repository.js";

import { initIncomes } from "./features/incomes/incomes.js";
import { initExpenses } from "./features/expenses/expenses.js";
import { initTabs } from "./ui/tabs.js";
import { refresh } from "./ui/render.js";

import { subscribe } from "./core/events.js";

async function bootstrap() {
  await initRepository();

  state.incomes = await getIncomes();
  state.expenses = await getExpenses();

  const budgetsArray = await getBudgets();

  state.budgets = Object.fromEntries(
    budgetsArray.map(b => [b.category, b.amount])
  );

  const banner = document.getElementById("privacy-banner");
  const acceptBtn = document.getElementById("privacy-accept");

  if (localStorage.getItem("privacyAccepted")) {
    banner.style.display = "none";
  }

  acceptBtn?.addEventListener("click", () => {
    localStorage.setItem("privacyAccepted", "true");
    banner.style.display = "none";
  });


  refresh();
}

initIncomes(document.getElementById("income-form"));
initExpenses(document.getElementById("expense-form"));
initTabs();

subscribe(refresh);

bootstrap();

