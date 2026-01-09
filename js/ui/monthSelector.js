import { state } from "../core/state.js";
import { notify } from "../core/events.js";

export function renderMonthSelector(container) {
  container.innerHTML = `
    <label>Mes:</label>
    <input type="month" value="${state.currentMonth}" />
  `;

  container.querySelector("input").addEventListener("change", e => {
    state.currentMonth = e.target.value;
    notify();
  });
}