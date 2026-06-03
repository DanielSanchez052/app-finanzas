import type { FC } from "react";

interface DangerZoneSectionProps {
  onClearLocalData: () => void;
}

export const DangerZoneSection: FC<DangerZoneSectionProps> = ({
  onClearLocalData
}) => {
  return (
    <section className="bg-slate-900/60 border border-red-900 rounded-lg p-4">
      <h2 className="text-lg font-semibold mb-1 text-red-300">Zona de peligro</h2>
      <p className="text-xs text-red-300/80 mb-4">
        Esta acción eliminará todos los datos locales de la app. No se puede deshacer.
      </p>

      <button
        type="button"
        onClick={onClearLocalData}
        className="inline-flex items-center justify-center px-3 py-1.5 text-sm rounded bg-red-700 hover:bg-red-600 text-white"
      >
        Limpiar datos locales (próximamente)
      </button>
    </section>
  );
};
