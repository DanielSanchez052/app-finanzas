import ensureAuthenticated from "./authenticate.js";
import { findAppFolder, findLatestYearFile } from "./utils.js";

export default async function downloadBackup() {
  await ensureAuthenticated();

  const folder = await findAppFolder();
  if (!folder) {
    throw new Error("No se encontró la carpeta 'app-finanzas' en Google Drive.");
  }

  const file = await findLatestYearFile(folder.id);
  if (!file) {
    throw new Error("No se encontró ningún backup en la carpeta 'app-finanzas'.");
  }

  const res = await window.gapi.client.drive.files.get({
    fileId: file.id,
    alt: "media"
  });

  const raw = res.body || res.result || res;
  const text = typeof raw === "string" ? raw : JSON.stringify(raw);
  const data = JSON.parse(text);

  return data; // { incomes, expenses, budgets }
}