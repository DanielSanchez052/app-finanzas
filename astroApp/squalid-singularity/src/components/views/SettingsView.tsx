import type { ChangeEvent } from "react";
import { useEffect, useState } from "react";
import { useAppContext } from "../../context/AppContext";
import {
  getSelectedProvider as coreGetSelectedProvider,
  setSelectedProvider as coreSetSelectedProvider
} from "../../core/persistence/cloud/index.js";
import {
  getProviderConfig,
  setProviderConfig
} from "../../core/persistence/cloud/googleDrive/config.js";
import { CloudPersistenceSection } from "../settings/CloudPersistenceSection";
import { LocalBackupSection } from "../settings/LocalBackupSection";
import { CloudBackupSection } from "../settings/CloudBackupSection";
import { DangerZoneSection } from "../settings/DangerZoneSection";

export default function SettingsView() {
  const { backup, cloud, state } = useAppContext();

  const [backupFormat, setBackupFormat] = useState<"json" | "csv">("json");
  const [backupSection, setBackupSection] = useState<"all" | "expenses" | "incomes" | "budgets">("all");
  const [isCloudSaving, setIsCloudSaving] = useState(false);
  const [isCloudLoading, setIsCloudLoading] = useState(false);

  const [storageProvider, setStorageProvider] = useState<string>("none");
  const [googleClientId, setGoogleClientId] = useState("");
  const [googleApiKey, setGoogleApiKey] = useState("");
  const [storageStatus, setStorageStatus] = useState<string>("");
  const [storageStatusOk, setStorageStatusOk] = useState(false);

  // TODO: change this to use a more secure way to load the scripts
  useEffect(() => {
    const urls = [
      "https://accounts.google.com/gsi/client",
      "https://apis.google.com/js/api.js"
    ];
 
    const scripts = urls.map(src => {
      const s = document.createElement("script");
      s.src = src;
      s.async = true;
      s.defer = true;
      document.head.appendChild(s);
      return s;
    });
 
    return () => {
      scripts.forEach(s => document.head.removeChild(s));
    };
  }, []);

  useEffect(() => {
    // Inicializar selector de proveedor desde core/localStorage
    const savedProvider = coreGetSelectedProvider();
    if (cloud.cloudProviders.includes(savedProvider)) {
      setStorageProvider(savedProvider);
    } else {
      setStorageProvider("none");
    }

    // Inicializar credenciales de Google Drive desde config del core
    const { clientId, apiKey } = getProviderConfig();
    if (clientId) setGoogleClientId(clientId);
    if (apiKey) setGoogleApiKey(apiKey);

    const savedEmail =
      typeof window !== "undefined"
        ? window.localStorage.getItem("googleDriveAccountEmail") || ""
        : "";

    // Estado inicial similar a initGoogleDriveFromState
    if (savedProvider === "none") {
      setStorageStatus("Persistencia en la nube desactivada.");
      setStorageStatusOk(false);
    } else if (savedProvider === "google-drive") {
      if (clientId && apiKey && savedEmail) {
        setStorageStatus(`Conectado a Google Drive como ${savedEmail}.`);
        setStorageStatusOk(true);
      } else if (clientId && apiKey) {
        setStorageStatus(
          "Google Drive configurado. Puedes autenticar para vincular una cuenta."
        );
        setStorageStatusOk(true);
      } else {
        setStorageStatus("Seleccionado Google Drive, pero faltan credenciales.");
        setStorageStatusOk(false);
      }
    } else if (savedProvider) {
      setStorageStatus(`Proveedor "${savedProvider}" seleccionado.`);
      setStorageStatusOk(true);
    }
  }, [cloud.cloudProviders]);

  const handleExport = () => {
    const result = backup.exportData(backupFormat, backupSection);
    if (result && typeof result.download === "function") {
      result.download();
    }
  };

  const handleImportFile = (file: File) => {
    backup.importData(file, "json", "all");
  };

  const getSelectedProvider = () => {
    if (typeof window === "undefined") return null;
    return window.localStorage.getItem("storageProvider");
  };

  const handleCloudSave = async () => {
    const provider = getSelectedProvider();
    if (!provider) {
      alert(
        "Primero selecciona y configura un proveedor de almacenamiento en la sección de Persistencia de Datos."
      );
      return;
    }

    const data = {
      incomes: state.incomes,
      expenses: state.expenses,
      budgets: state.budgets
    };

    try {
      setIsCloudSaving(true);
      await cloud.saveOnCloud(provider, data);
      alert("Backup guardado en la nube correctamente.");
    } catch (err) {
      console.error(err);
      alert("Error al guardar el backup en la nube.");
    } finally {
      setIsCloudSaving(false);
    }
  };

  const handleCloudLoad = async () => {
    const provider = getSelectedProvider();
    if (!provider) {
      alert(
        "Primero selecciona y configura un proveedor de almacenamiento en la sección de Persistencia de Datos."
      );
      return;
    }

    try {
      setIsCloudLoading(true);
      const data = await cloud.loadFromCloud(provider);
      if (!data || !data.incomes || !data.expenses || !data.budgets) {
        alert("Backup remoto inválido o incompleto.");
        return;
      }

      const blob = new Blob([JSON.stringify(data)], { type: "application/json" });
      const file = new File([blob], "backup-remote.json", { type: "application/json" });
      await backup.importData(file, "json", "all");
      alert("Backup restaurado desde la nube correctamente.");
    } catch (err) {
      console.error(err);
      alert("Error al restaurar el backup desde la nube.");
    } finally {
      setIsCloudLoading(false);
    }
  };

  const handleClearLocalData = async () => {
    const confirm1 = confirm(
      "Esto eliminará TODOS los datos locales de la app.\n\n¿Deseas continuar?"
    );
    if (!confirm1) return;

    const confirm2 = confirm(
      "Última confirmación.\nEsta acción NO se puede deshacer."
    );
    if (!confirm2) return;

    // El core original usaba clearDatabase desde repository.js; aquí, por ahora,
    // dejamos solo un mensaje para no duplicar lógica peligrosa sin UI dedicada.
    alert(
      "La limpieza total de la base de datos local se implementará cuando migremos la sección completa de Persistencia de datos."
    );
  };

  return (
    <div className="space-y-6">
      <CloudPersistenceSection
        storageProvider={storageProvider}
        storageStatus={storageStatus}
        storageStatusOk={storageStatusOk}
        googleClientId={googleClientId}
        googleApiKey={googleApiKey}
        onProviderChange={value => {
          setStorageProvider(value);
          coreSetSelectedProvider(value);

          if (value === "none") {
            if (typeof window !== "undefined") {
              window.localStorage.removeItem("googleDriveAccountEmail");
            }
            setStorageStatus("Persistencia en la nube desactivada.");
            setStorageStatusOk(false);
            return;
          }

          if (value === "google-drive") {
            const { clientId, apiKey } = getProviderConfig();
            const savedEmail =
              typeof window !== "undefined"
                ? window.localStorage.getItem("googleDriveAccountEmail") || ""
                : "";

            if (clientId) setGoogleClientId(clientId);
            if (apiKey) setGoogleApiKey(apiKey);

            if (clientId && apiKey && savedEmail) {
              setStorageStatus(`Conectado a Google Drive como ${savedEmail}.`);
              setStorageStatusOk(true);
            } else if (clientId && apiKey) {
              setStorageStatus(
                "Google Drive configurado. Puedes autenticar para vincular una cuenta."
              );
              setStorageStatusOk(true);
            } else {
              setStorageStatus(
                "Seleccionado Google Drive, pero faltan credenciales."
              );
              setStorageStatusOk(false);
            }
          } else {
            setStorageStatus(`Proveedor "${value}" seleccionado.`);
            setStorageStatusOk(true);
          }
        }}
        onGoogleClientIdChange={setGoogleClientId}
        onGoogleApiKeyChange={setGoogleApiKey}
        onConfigureProvider={async () => {
          const value = storageProvider;
          if (value === "none") {
            alert("Primero selecciona un proveedor de almacenamiento.");
            return;
          }

          if (value === "google-drive") {
            const clientId = googleClientId.trim();
            const apiKey = googleApiKey.trim();

            if (!clientId || !apiKey) {
              alert("Para usar Google Drive debes indicar Client ID y API Key.");
              setStorageStatus("Falta configurar credenciales de Google Drive.");
              setStorageStatusOk(false);
              return;
            }

            setProviderConfig({ clientId, apiKey });

            try {
              const result = await cloud.authenticate("google-drive");
              const email = result?.user?.email || "desconocido";

              if (typeof window !== "undefined") {
                window.localStorage.setItem("googleDriveAccountEmail", email);
              }

              setStorageStatus(`Conectado a Google Drive como ${email}.`);
              setStorageStatusOk(true);
              alert(
                `Google Drive configurado y autenticado correctamente para ${email}.`
              );
            } catch (err) {
              console.error(err);
              setStorageStatus("Error al autenticar con Google Drive.");
              setStorageStatusOk(false);
              alert(
                "Error al autenticar con Google Drive. Revisa tus credenciales y permisos."
              );
            }
          } else {
            alert(
              `Configuración específica para el proveedor "${value}" aún no está implementada.`
            );
          }
        }}
      />

      <LocalBackupSection
        backupFormat={backupFormat}
        backupSection={backupSection}
        onBackupFormatChange={setBackupFormat}
        onBackupSectionChange={setBackupSection}
        onExport={handleExport}
        onImport={handleImportFile}
      />

      <CloudBackupSection
        isCloudSaving={isCloudSaving}
        isCloudLoading={isCloudLoading}
        onCloudSave={handleCloudSave}
        onCloudLoad={handleCloudLoad}
      />

      <DangerZoneSection onClearLocalData={handleClearLocalData} />
    </div>
  );
}
