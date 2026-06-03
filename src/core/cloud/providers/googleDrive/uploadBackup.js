import ensureAuthenticated from "./authenticate.js";
import { findOrCreateAppFolder, findExistingYearFile } from "./utils.js";


export default async function uploadBackup(backupJson) {
  await ensureAuthenticated();

  const folderId = await findOrCreateAppFolder();
  const year = new Date().getFullYear();
  const fileName = `backup-${year}.json`;
  const existingFile = await findExistingYearFile(folderId, fileName);
  const content = JSON.stringify(backupJson);

  const boundary = "-------314159265358979323846";
  const delimiter = "\r\n--" + boundary + "\r\n";
  const closeDelimiter = "\r\n--" + boundary + "--";


  const isUpdate = !!existingFile;

  const metadata = {
    name: fileName,
    mimeType: "application/json"
  }

  if (!isUpdate) {
    metadata.parents = [folderId]
  }

  const multipartRequestBody =
    delimiter +
    "Content-Type: application/json\r\n\r\n" +
    JSON.stringify(metadata) +
    delimiter +
    "Content-Type: application/json\r\n\r\n" +
    content +
    closeDelimiter;

  const path = isUpdate
    ? "/upload/drive/v3/files/" + existingFile.id
    : "/upload/drive/v3/files";
  
  const method = isUpdate ? "PATCH" : "POST";

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