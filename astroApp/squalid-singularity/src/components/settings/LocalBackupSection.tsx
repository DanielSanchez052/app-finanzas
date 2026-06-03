import { useRef, useState } from "react";
import type { FC, ChangeEvent } from "react";

interface LocalBackupSectionProps {
  backupFormat: "json" | "csv";
  backupSection: "all" | "expenses" | "incomes" | "budgets";
  onBackupFormatChange: (value: "json" | "csv") => void;
  onBackupSectionChange: (
    value: "all" | "expenses" | "incomes" | "budgets"
  ) => void;
  onExport: () => void;
  onImport: (file: File) => void;
}

export const LocalBackupSection: FC<LocalBackupSectionProps> = ({
  backupFormat,
  backupSection,
  onBackupFormatChange,
  onBackupSectionChange,
  onExport,
  onImport
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [selectedFileName, setSelectedFileName] = useState<string>("");

  const handleFormatChange = (e: ChangeEvent<HTMLSelectElement>) => {
    onBackupFormatChange(e.target.value as "json" | "csv");
  };

  const handleSectionChange = (e: ChangeEvent<HTMLSelectElement>) => {
    onBackupSectionChange(
      e.target.value as "all" | "expenses" | "incomes" | "budgets"
    );
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFileName(file.name);
    onImport(file);
  };

  return (
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
            onChange={handleFormatChange}
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
            onChange={handleSectionChange}
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
            onClick={onExport}
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
            Sube un archivo <span className="font-mono">.json</span> generado por
            esta misma app para restaurar tus datos.
          </p>

          <label className="inline-flex items-center gap-2 cursor-pointer">
            <span className="inline-flex items-center justify-center px-3 py-1.5 text-xs font-medium rounded bg-slate-800 hover:bg-slate-700 text-slate-50 border border-slate-600">
              Seleccionar archivo JSON
            </span>
            <span className="text-[11px] text-slate-400">
              {selectedFileName || "Ningún archivo seleccionado"}
            </span>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>
        </div>
      </div>
    </section>
  );
};
