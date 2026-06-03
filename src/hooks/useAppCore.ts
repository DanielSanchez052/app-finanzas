import { useEffect, useMemo, useState } from "react";
import type { CoreState, CoreActions, BackupAPI, CloudAPI } from "../context/AppContext";
import type { AppCore, NewIncomeInput, NewExpenseInput } from "../core/app/appCore";

interface UseAppCoreResult {
  initialized: boolean;
  state: CoreState;
  actions: CoreActions;
  backup: BackupAPI;
  cloud: CloudAPI;
}
// === Inyección de AppCore ===

let appCoreInstance: AppCore | null = null;

export function setAppCoreInstance(instance: AppCore) {
  appCoreInstance = instance;
}

function getAppCore(): AppCore {
  if (!appCoreInstance) {
    throw new Error("AppCore instance no inicializada. Llama a setAppCoreInstance antes de usar useAppCore.");
  }
  return appCoreInstance;
}

export function useAppCore(): UseAppCoreResult {
  const appCore = getAppCore();

  const [initialized, setInitialized] = useState(false);
  const [snapshot, setSnapshot] = useState<CoreState>(() => appCore.getState());

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      try {
        await appCore.initialize();
        if (!cancelled) {
          setInitialized(true);
        }
      } catch (err) {
        console.error("Error inicializando el core:", err);
        if (!cancelled) {
          setInitialized(false);
        }
      }
    }

    const unsubscribe = appCore.subscribe(state => {
      if (cancelled) return;
      setSnapshot(state);
    });

    bootstrap();

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, [appCore]);

  const actions: CoreActions = useMemo(
    () => ({
      async addIncome(input: NewIncomeInput) {
        await appCore.addIncome(input);
      },
      async addExpense(input: NewExpenseInput) {
        await appCore.addExpense(input);
      },
      async saveBudget(budget: { category: string; amount: number }) {
        await appCore.saveBudget(budget);
      },
      setCurrentMonth(month: string) {
        appCore.setCurrentMonth(month);
      },
      async clearLocalData() {
        await appCore.clearLocalData();
      }
    }),
    [appCore]
  );

  const backupApi: BackupAPI = useMemo(
    () => ({
      exportData: (format: string, section?: string) => {
        const blob = appCore.backup.exportData(
          format as any,
          (section ?? "all") as any
        );

        const type = blob.type || "application/json";
        const filename = `backup-finanzas-${new Date().toISOString()}.${format}`;

        const download = () => {
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = filename;
          a.click();
          URL.revokeObjectURL(url);
        };

        return { content: blob, type, format, download };
      },
      importData: async (file: File, format: string, section?: string) => {
        await appCore.backup.importData(
          file,
          format as any,
          (section ?? "all") as any
        );
      }
    }),
    [appCore]
  );

  const cloudApi: CloudAPI = useMemo(
    () => ({
      authenticate: async (_provider: string) => appCore.cloud.authenticate(),
      saveOnCloud: async (_provider: string, _data: any) => appCore.cloud.saveOnCloud(),
      loadFromCloud: async (_provider: string) => appCore.cloud.loadFromCloud(),
      cloudProviders: []
    }),
    [appCore]
  );

  return {
    initialized,
    state: snapshot,
    actions,
    backup: backupApi,
    cloud: cloudApi
  };
}
