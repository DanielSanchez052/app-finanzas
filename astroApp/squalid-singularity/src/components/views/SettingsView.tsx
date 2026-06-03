import type { ChangeEvent } from "react";
import { useEffect, useRef, useState } from "react";
import { useAppContext } from "../../context/AppContext";
import {
  getSelectedProvider as coreGetSelectedProvider,
  setSelectedProvider as coreSetSelectedProvider
} from "../../core/persistence/cloud/index.js";
import { getProviderConfig, setProviderConfig } from "../../core/persistence/cloud/googleDrive/config.js";

export default function SettingsView() {
  const { backup, cloud, state } = useAppContext();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

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

  const handleImportChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

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
      <section className="bg-slate-900/60 border border-slate-800 rounded-lg p-4">
        <h2 className="text-lg font-semibold mb-1">Persistencia de datos</h2>
        <p className="text-xs text-slate-400 mb-4">
          Selecciona y configura un proveedor de almacenamiento en la nube.
        </p>

        <div className="space-y-3">
          <div className="space-y-1">
            <label className="block text-xs text-slate-300">Almacenamiento</label>
            <select
              className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-sm max-w-xs"
              value={storageProvider}
              onChange={e => {
                const value = e.target.value;
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
            >
              <option value="none">Ninguno</option>
              <option value="google-drive">Google Drive</option>
              <option value="s3">S3</option>
            </select>
          </div>

          {storageProvider === "google-drive" && (
            <div className="mt-3 space-y-3 border-t border-slate-800 pt-3">
              <h3 className="text-sm font-medium">Configuración Google Drive</h3>
              <div className="space-y-2">
                <div className="space-y-1">
                  <label className="block text-xs text-slate-300">Client ID</label>
                  <input
                    type="text"
                    value={googleClientId}
                    onChange={e => setGoogleClientId(e.target.value)}
                    placeholder="tu-client-id.apps.googleusercontent.com"
                    className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs text-slate-300">API Key</label>
                  <input
                    type="text"
                    value={googleApiKey}
                    onChange={e => setGoogleApiKey(e.target.value)}
                    placeholder="tu API key"
                    className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row sm:items-center gap-3 mt-3">
            <div
              className={`text-xs ${
                storageStatusOk ? "text-emerald-400" : "text-slate-400"
              }`}
            >
              {storageStatus}
            </div>
            <div className="flex-1" />
            <button
              type="button"
              onClick={async () => {
                const value = storageProvider;
                if (value === "none") {
                  alert("Primero selecciona un proveedor de almacenamiento.");
                  return;
                }

                if (value === "google-drive") {
                  const clientId = googleClientId.trim();
                  const apiKey = googleApiKey.trim();

                  if (!clientId || !apiKey) {
                    alert(
                      "Para usar Google Drive debes indicar Client ID y API Key."
                    );
                    setStorageStatus(
                      "Falta configurar credenciales de Google Drive."
                    );
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

                    setStorageStatus(
                      `Conectado a Google Drive como ${email}.`
                    );
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
              className="inline-flex items-center justify-center px-3 py-1.5 text-sm rounded bg-slate-700 hover:bg-slate-600 text-white self-start"
            >
              Configurar proveedor
            </button>
          </div>
        </div>
      </section>
      <section className="bg-slate-900/60 border border-slate-800 rounded-lg p-4">
        <h2 className="text-lg font-semibold mb-1">Backup local</h2>
        <p className="text-xs text-slate-400 mb-4">
          Guarda y restaura tus datos manualmente en tu dispositivo.
        </p>

        <div className="grid gap-3 md:grid-cols-2">
          <div className="space-y-2">
            <label className="block text-xs text-slate-300">Formato</label>
            <select
              className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-sm"
              value={backupFormat}
              onChange={e => setBackupFormat(e.target.value as "json" | "csv")}
            >
              <option value="json">json</option>
              <option value="csv">csv</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-xs text-slate-300">Data</label>
            <select
              className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-sm"
              value={backupSection}
              onChange={e =>
                setBackupSection(
                  e.target.value as "all" | "expenses" | "incomes" | "budgets"
                )
              }
            >
              <option value="all">Todos</option>
              <option value="expenses">Solo gastos</option>
              <option value="incomes">Solo ingresos</option>
              <option value="budgets">Solo presupuestos</option>
            </select>
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-4">
          <div>
            <button
              type="button"
              onClick={handleExport}
              className="inline-flex items-center justify-center px-3 py-1.5 text-sm rounded bg-emerald-600 hover:bg-emerald-500 text-white"
            >
              Exportar backup
            </button>
          </div>

          <div className="border border-dashed border-slate-700 rounded-md p-3 bg-slate-950/60">
            <h3 className="text-xs font-semibold text-slate-200 mb-1">
              Restaurar backup local
            </h3>
            <p className="text-[11px] text-slate-400 mb-2">
              Sube un archivo <span className="font-mono">.json</span> generado por esta misma app para restaurar tus datos.
            </p>

            <label className="inline-flex items-center gap-2 cursor-pointer">
              <span className="inline-flex items-center justify-center px-3 py-1.5 text-xs font-medium rounded bg-slate-800 hover:bg-slate-700 text-slate-50 border border-slate-600">
                Seleccionar archivo JSON
              </span>
              <span className="text-[11px] text-slate-400">
                {fileInputRef.current?.files?.[0]?.name || "Ningún archivo seleccionado"}
              </span>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleImportChange}
                className="hidden"
              />
            </label>
          </div>
        </div>
      </section>

      <section className="bg-slate-900/60 border border-slate-800 rounded-lg p-4">
        <h2 className="text-lg font-semibold mb-1">Backup en la nube</h2>
        <p className="text-xs text-slate-400 mb-4">
          Usa el proveedor configurado en la sección de Persistencia de datos para guardar un backup completo de tus datos.
        </p>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={handleCloudSave}
            disabled={isCloudSaving}
            className="inline-flex items-center justify-center px-3 py-1.5 text-sm rounded bg-sky-600 hover:bg-sky-500 disabled:opacity-60 text-white"
          >
            {isCloudSaving ? "Guardando..." : "Guardar backup en la nube"}
          </button>
          <button
            type="button"
            onClick={handleCloudLoad}
            disabled={isCloudLoading}
            className="inline-flex items-center justify-center px-3 py-1.5 text-sm rounded bg-slate-700 hover:bg-slate-600 disabled:opacity-60 text-white"
          >
            {isCloudLoading ? "Restaurando..." : "Restaurar desde la nube"}
          </button>
        </div>
      </section>

      <section className="bg-slate-900/60 border border-red-900 rounded-lg p-4">
        <h2 className="text-lg font-semibold mb-1 text-red-300">Zona de peligro</h2>
        <p className="text-xs text-red-300/80 mb-4">
          Esta acción eliminará todos los datos locales de la app. No se puede deshacer.
        </p>

        <button
          type="button"
          onClick={handleClearLocalData}
          className="inline-flex items-center justify-center px-3 py-1.5 text-sm rounded bg-red-700 hover:bg-red-600 text-white"
        >
          Limpiar datos locales (próximamente)
        </button>
      </section>
    </div>
  );
}
