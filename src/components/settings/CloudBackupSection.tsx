import type { FC } from "react";
 
interface CloudBackupSectionProps {
  isCloudSaving: boolean;
  isCloudLoading: boolean;
  onCloudSave: () => void;
  onCloudLoad: () => void;
}
 
export const CloudBackupSection: FC<CloudBackupSectionProps> = ({
  isCloudSaving,
  isCloudLoading,
  onCloudSave,
  onCloudLoad
}) => {
  return (
    <section className="bg-slate-900/60 border border-slate-800 rounded-lg p-4">
      <h2 className="text-lg font-semibold mb-1">Backup en la nube</h2>
      <p className="text-xs text-slate-400 mb-4">
        Usa el proveedor configurado en la sección de Persistencia de datos para guardar un
        backup completo de tus datos.
      </p>
 
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={onCloudSave}
          disabled={isCloudSaving}
          className="inline-flex items-center justify-center px-3 py-1.5 text-sm rounded bg-sky-600 hover:bg-sky-500 disabled:opacity-60 text-white"
        >
          {isCloudSaving ? "Guardando..." : "Guardar backup en la nube"}
        </button>
        <button
          type="button"
          onClick={onCloudLoad}
          disabled={isCloudLoading}
          className="inline-flex items-center justify-center px-3 py-1.5 text-sm rounded bg-slate-700 hover:bg-slate-600 disabled:opacity-60 text-white"
        >
          {isCloudLoading ? "Restaurando..." : "Restaurar desde la nube"}
        </button>
      </div>
    </section>
  );
};
 