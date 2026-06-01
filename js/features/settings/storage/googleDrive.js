import cloud from "../../../core/persistence/cloud/index.js";
import { getProviderConfig, setProviderConfig } from "../../../core/persistence/cloud/googleDrive/config.js";

export function renderGoogleDriveConfig(container) {
  container.innerHTML = `
    <div id="google-drive-config" style="margin-top:10px; display:none;">
      <h3>Configuración Google Drive</h3>
      <div>
        <label>Client ID: </label>
        <input type="text" id="google-drive-client-id" placeholder="tu-client-id.apps.googleusercontent.com" style="width:100%;" />
      </div>
      <div style="margin-top:5px;">
        <label>API Key: </label>
        <input type="text" id="google-drive-api-key" placeholder="tu API key" style="width:100%;" />
      </div>
    </div>
  `;
}

export function toggleGoogleDriveVisibility(currentProvider) {
  const googleDriveConfig = document.getElementById("google-drive-config");
  if (!googleDriveConfig) return;

  if (currentProvider === "google-drive") {
    googleDriveConfig.style.display = "block";
  } else {
    googleDriveConfig.style.display = "none";
  }
}

export function initGoogleDriveFromState({ currentProvider, setStatus }) {
  const clientIdInput = document.getElementById("google-drive-client-id");
  const apiKeyInput = document.getElementById("google-drive-api-key");

  if (!clientIdInput || !apiKeyInput) return;

  const { clientId, apiKey } = getProviderConfig();
  if (clientId) clientIdInput.value = clientId;
  if (apiKey) apiKeyInput.value = apiKey;

  const savedEmail = localStorage.getItem("googleDriveAccountEmail") || "";

  toggleGoogleDriveVisibility(currentProvider);

  if (currentProvider === "google-drive") {
    if (clientId && apiKey && savedEmail) {
      setStatus(`Conectado a Google Drive como ${savedEmail}.`, true);
    } else if (clientId && apiKey) {
      setStatus("Google Drive configurado. Puedes autenticar para vincular una cuenta.", true);
    } else {
      setStatus("Seleccionado Google Drive, pero faltan credenciales.", false);
    }
  }
}

export async function handleGoogleDriveSelection({ setStatus }) {
  const clientIdInput = document.getElementById("google-drive-client-id");
  const apiKeyInput = document.getElementById("google-drive-api-key");

  if (!clientIdInput || !apiKeyInput) {
    setStatus("Error interno: no se encontró la UI de Google Drive.");
    return;
  }

  const clientId = clientIdInput.value.trim();
  const apiKey = apiKeyInput.value.trim();

  if (!clientId || !apiKey) {
    alert("Para usar Google Drive debes indicar Client ID y API Key.");
    setStatus("Falta configurar credenciales de Google Drive.");
    return;
  }

  // Guardar credenciales a través de la capa de config del proveedor
  setProviderConfig({ clientId, apiKey });

  try {
    const result = await cloud.authenticate("google-drive");
    const email = result?.user?.email || "desconocido";

    localStorage.setItem("googleDriveAccountEmail", email);

    setStatus(`Conectado a Google Drive como ${email}.`, true);
    alert(`Google Drive configurado y autenticado correctamente para ${email}.`);
  } catch (err) {
    console.error(err);
    setStatus("Error al autenticar con Google Drive.");
    alert("Error al autenticar con Google Drive. Revisa tus credenciales y permisos.");
  }
}
