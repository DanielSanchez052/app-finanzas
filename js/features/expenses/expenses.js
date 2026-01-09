import { state } from "../../core/state.js";
import { getMonth, generateId } from "../../core/utils.js";
import { notify } from "../../core/events.js";
import { addExpense } from "../../core/persistence/repository.js";

export function initExpenses(form) {
  form.addEventListener("submit", async e => {
    e.preventDefault();

    const [date, category, desc, amount] = form.elements;

    const expense = {
      id: generateId(),
      date: date.value,
      month: getMonth(date.value),
      category: category.value,
      desc: desc.value,
      amount: Number(amount.value)
    };

    state.expenses.push(expense);
    await addExpense(expense)

    form.reset();
    notify();
  });
}
