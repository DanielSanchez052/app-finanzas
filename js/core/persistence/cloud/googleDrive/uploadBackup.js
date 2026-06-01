import ensureAuthenticated from "./authenticate.js";

async function findExistingBackupFile() {
  const res = await window.gapi.client.drive.files.list({
    q: "name = 'app-finanzas-backup.json' and trashed = false",
    fields: "files(id, name)"
  });

  const files = res.result && res.result.files ? res.result.files : [];
  return files[0] || null;
}

export default async function uploadBackup(backupJson) {
  await ensureAuthenticated();

  const existingFile = await findExistingBackupFile();
  const content = JSON.stringify(backupJson);

  const boundary = "-------314159265358979323846";
  const delimiter = "\r\n--" + boundary + "\r\n";
  const closeDelimiter = "\r\n--" + boundary + "--";

  const metadata = {
    name: "app-finanzas-backup.json",
    mimeType: "application/json"
  };

  const multipartRequestBody =
    delimiter +
    "Content-Type: application/json\r\n\r\n" +
    JSON.stringify(metadata) +
    delimiter +
    "Content-Type: application/json\r\n\r\n" +
    content +
    closeDelimiter;

  const path = existingFile
    ? "/upload/drive/v3/files/" + existingFile.id
    : "/upload/drive/v3/files";

  const method = existingFile ? "PATCH" : "POST";

  await window.gapi.client.request({
    path,
    method,
    params: { uploadType: "multipart" },
    headers: {
      "Content-Type": "multipart/related; boundary=" + boundary
    },
    body: multipartRequestBody
  });
}