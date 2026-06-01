import { renderBackup } from "./backup.js";
import { renderStorageSettings } from "./storage/index.js";

export function renderSettings(container) {
  container.innerHTML = `
    <div id="backup"></div>
    <div id="storage"></div>
  `;
  
  renderBackup(document.getElementById("backup"));
  renderStorageSettings(document.getElementById("storage"));
}
