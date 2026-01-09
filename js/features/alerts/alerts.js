import { calculateAlerts } from "../../core/alerts.js";

export function renderAlerts(container) {
  const alerts = calculateAlerts();

  if (!alerts.length) {
    container.innerHTML = "";
    return;
  }

  container.innerHTML = `
    <h2>Alertas</h2>
    <ul class="alerts">
      ${alerts.map(a => `
        <li class="alert ${a.type}">
          ${a.message}
        </li>
      `).join("")}
    </ul>
  `;
}
