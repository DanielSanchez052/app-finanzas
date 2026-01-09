import { state } from "../../core/state.js";
import { addIncome } from "../../core/persistence/repository.js"
import { getMonth, generateId } from "../../core/utils.js";
import { notify } from "../../core/events.js";

export function initIncomes(form) {
  form.addEventListener("submit", e => {
    e.preventDefault();

    const [date, type, amount] = form.elements;

    const income = {
      id: generateId(),
      date: date.value,
      month: getMonth(date.value),
      type: type.value,
      amount: Number(amount.value)
    };

    addIncome(income);
    state.incomes.push(income);

    form.reset();
    notify();
  });
}
