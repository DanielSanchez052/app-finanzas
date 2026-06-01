import cloud, { getSelectedProvider, setSelectedProvider } from "../../../core/persistence/cloud/index.js";
import { 
  renderGoogleDriveConfig, 
  initGoogleDriveFromState, 
  handleGoogleDriveSelection, 
  toggleGoogleDriveVisibility 
} from "./googleDrive.js";

export function renderStorageSettings(container){
  container.innerHTML = `
    <br />
    <h2>Persistencia Datos</h2>

    <div>
      <label>Almacenamiento: </label>
      <select id="storage-medium">
        <option value="none">Ninguno</option>
        <option value="google-drive">Google Drive</option>
        <option value="s3">S3</option>
      </select>
    </div>
 
    <div id="storage-provider-config" style="margin-top:10px;"></div>
 
    <div id="storage-status" style="margin:10px 0px; font-size:0.9em; color:#aaa;"></div>

    <button id="configure-storage-provider" style="margin-left:8px;">
        Configurar proveedor
    </button>
    `;

  const storageMedium = document.getElementById("storage-medium");
  const statusEl = document.getElementById("storage-status");
  const configureBtn = document.getElementById("configure-storage-provider");
  const storageProviderConfig = document.getElementById("storage-provider-config");

  renderGoogleDriveConfig(storageProviderConfig);

  function setStatus(text, ok = false) {
    statusEl.textContent = text;
    statusEl.style.color = ok ? "green" : "#aaa";
  }

  const savedProvider = getSelectedProvider();
  if (cloud.cloudProviders.includes(savedProvider)) {
    storageMedium.value = savedProvider;
  }

  initGoogleDriveFromState({
    currentProvider: storageMedium.value,
    setStatus
  });
  
  toggleGoogleDriveVisibility(storageMedium.value);

  storageMedium.addEventListener("change", (e) => {
    const value = e.target.value;
  
    setSelectedProvider(value);
  
    toggleGoogleDriveVisibility(value);
  
    if (value === "none") {
      localStorage.removeItem("googleDriveAccountEmail");
      setStatus("Persistencia en la nube desactivada.");
      return;
    }
    
    if (value === "google-drive") {
      initGoogleDriveFromState({
        currentProvider: value,
        setStatus
      });
    } else {
      setStatus(`Proveedor "${value}" seleccionado.`, true);
    }
  });

  configureBtn.addEventListener("click", async () => {
    const value = storageMedium.value;

    if (value === "none") {
      alert("Primero selecciona un proveedor de almacenamiento.");
      return;
    }

    if (value === "google-drive") {
      await handleGoogleDriveSelection({ setStatus });
    } else {
      // En el futuro aquí iría la configuración específica de S3 u otros
      alert(`Configuración específica para el proveedor "${value}" aún no está implementada.`);
    }
  });

  if (storageMedium.value === "none") {
    setStatus("Persistencia en la nube desactivada.");
  } else if (storageMedium.value === "google-drive") {
    // `initGoogleDriveFromState` ya deja un mensaje adecuado
  } else {
    setStatus(`Proveedor "${storageMedium.value}" seleccionado.`, true);
  }
}