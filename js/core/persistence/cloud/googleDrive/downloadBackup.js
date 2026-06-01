import ensureAuthenticated from "./authenticate.js";

async function findExistingBackupFile() {
  const res = await window.gapi.client.drive.files.list({
    q: "name = 'app-finanzas-backup.json' and trashed = false",
    fields: "files(id, name)"
  });

  const files = res.result && res.result.files ? res.result.files : [];
  return files[0] || null;
}

export default async function downloadBackup() {
  await ensureAuthenticated();

  const file = await findExistingBackupFile();
  if (!file) {
    throw new Error("No se encontró backup en Google Drive.");
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