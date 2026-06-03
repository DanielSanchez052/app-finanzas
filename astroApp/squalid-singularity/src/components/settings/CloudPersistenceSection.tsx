import type { FC, ChangeEvent } from "react";

interface CloudPersistenceSectionProps {
  storageProvider: string;
  storageStatus: string;
  storageStatusOk: boolean;
  googleClientId: string;
  googleApiKey: string;
  onProviderChange: (value: string) => void;
  onGoogleClientIdChange: (value: string) => void;
  onGoogleApiKeyChange: (value: string) => void;
  onConfigureProvider: () => void;
}

export const CloudPersistenceSection: FC<CloudPersistenceSectionProps> = ({
  storageProvider,
  storageStatus,
  storageStatusOk,
  googleClientId,
  googleApiKey,
  onProviderChange,
  onGoogleClientIdChange,
  onGoogleApiKeyChange,
  onConfigureProvider
}) => {
  const handleProviderSelectChange = (e: ChangeEvent<HTMLSelectElement>) => {
    onProviderChange(e.target.value);
  };

  return (
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
            onChange={handleProviderSelectChange}
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
                  onChange={e => onGoogleClientIdChange(e.target.value)}
                  placeholder="tu-client-id.apps.googleusercontent.com"
                  className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-xs text-slate-300">API Key</label>
                <input
                  type="text"
                  value={googleApiKey}
                  onChange={e => onGoogleApiKeyChange(e.target.value)}
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
            onClick={onConfigureProvider}
            className="inline-flex items-center justify-center px-3 py-1.5 text-sm rounded bg-slate-700 hover:bg-slate-600 text-white self-start"
          >
            Configurar proveedor
          </button>
        </div>
      </div>
    </section>
  );
};
