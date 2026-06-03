
export async function findAppFolder() {
  const res = await window.gapi.client.drive.files.list({
    q: "name = 'app-finanzas' and mimeType = 'application/vnd.google-apps.folder' and trashed = false",
    fields: "files(id, name)"
  });
 
  const folders = res.result.files || [];
  return folders[0] || null;
}
 
export async function findLatestYearFile(folderId) {
  const res = await window.gapi.client.drive.files.list({
    q: `'${folderId}' in parents and name contains 'backup-' and name contains '.json' and trashed = false`,
    fields: "files(id, name)",
    orderBy: "name desc"
  });
 
  const files = res.result.files || [];
  return files[0] || null;
}

export async function findOrCreateAppFolder() {
  const res = await window.gapi.client.drive.files.list({
    q: "name = 'app-finanzas' and mimeType = 'application/vnd.google-apps.folder' and trashed = false",
    fields: "files(id, name)"
  });
 
  const existing = res.result.files && res.result.files[0];
  if (existing) return existing.id;
 
  const folderMetadata = {
    name: "app-finanzas",
    mimeType: "application/vnd.google-apps.folder"
  };
 
  const createRes = await window.gapi.client.drive.files.create({
    resource: folderMetadata,
    fields: "id"
  });
 
  return createRes.result.id;
}

export async function findExistingYearFile(folderId, fileName) {
  const res = await window.gapi.client.drive.files.list({
    q: `'${folderId}' in parents and name = '${fileName}' and trashed = false`,
    fields: "files(id, name)"
  });
 
  const files = res.result.files || [];
  return files[0] || null;
}