import { useEffect, useMemo, useState } from "react";
import { state as coreState } from "../core/state.js";
import { subscribe, notify } from "../core/events.js";
import backup from "../core/backup/index.js";
import cloud from "../core/persistence/cloud/index.js";
import {
  initRepository,
  getIncomes,
  getExpenses,
  getBudgets,
  addIncome as repoAddIncome,
  addExpense as repoAddExpense,
  saveBudget as repoSaveBudget
} from "../core/persistence/repository.js";
import type { CoreState, CoreActions, BackupAPI, CloudAPI, Budget } from "../context/AppContext";

interface UseAppCoreResult {
  initialized: boolean;
  state: CoreState;
  actions: CoreActions;
  backup: BackupAPI;
  cloud: CloudAPI;
}

function readCoreState(): CoreState {
  return {
    currentMonth: coreState.currentMonth || new Date().toISOString().slice(0, 7),
    incomes: coreState.incomes || [],
    expenses: coreState.expenses || [],
    // budgets: Object.entries(coreState.budgets || {}).map(([category, amount]) => ({ category, amount: Number(amount) }))
    budgets: coreState.budgets as Budget[] || []
  };
}

export function useAppCore(): UseAppCoreResult {
  const [initialized, setInitialized] = useState(false);
  const [snapshot, setSnapshot] = useState<CoreState>(() => readCoreState());

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      try {
        // 1) Inicializar IndexedDB
        await initRepository();

        // 2) Cargar datos persistidos y volcarlos al state del core
        const [incomes, expenses, budgets] = await Promise.all([
          getIncomes(),
          getExpenses(),
          getBudgets()
        ]);

        coreState.incomes = incomes || [];
        coreState.expenses = expenses || [];
        coreState.budgets = budgets || [];
        // 3) Notificar a los suscriptores (incluido este hook) para refrescar el snapshot
        notify();

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

    // Suscribirse a cambios del core
    const listener = () => {
      if (cancelled) return;
      setSnapshot(readCoreState());
    };

    subscribe(listener);
    bootstrap();

    return () => {
      // El core no expone unsubscribe, pero evitamos actualizar estado si el hook se desmonta
      cancelled = true;
    };
  }, []);

  const actions: CoreActions = useMemo(
    () => ({
      async addIncome(income: any) {
        await repoAddIncome(income);
        const currentIncomes = (coreState.incomes as any[]) || [];
        coreState.incomes = [...currentIncomes, income];
        notify();
      },
      async addExpense(expense: any) {
        await repoAddExpense(expense);
        const currentExpenses = (coreState.expenses as any[]) || [];
        coreState.expenses = [...currentExpenses, expense];
        notify();
      },
      async saveBudget(budget: { category: string; amount: number }) {
        await repoSaveBudget(budget);

        const currentBudgets = (coreState.budgets as Budget[]) || [];
        coreState.budgets = [
          ...currentBudgets,
          { category: budget.category, amount: budget.amount }
        ];



        notify();
      },
      setCurrentMonth(month: string) {
        coreState.currentMonth = month;
        notify();
      }
    }),
    []
  );

  const backupApi: BackupAPI = useMemo(
    () => ({
      // Delegamos directamente en el módulo backup del core
      exportData: (format: string, section?: string) =>
        backup.exportData(format, section ?? "all"),
      importData: async (file: File, format: string, section?: string) => {
        // El módulo backup ya se encarga de mutar state y persistir en IndexedDB.
        backup.importData(file, format, section ?? "all");
        // Forzamos re-render de React
        notify();
      }
    }),
    []
  );

  const cloudApi: CloudAPI = useMemo(
    () => ({
      authenticate: async (provider: string) => cloud.authenticate(provider),
      saveOnCloud: async (provider: string, data: any) => cloud.saveOnCloud(provider, data),
      loadFromCloud: async (provider: string) => cloud.loadFromCloud(provider),
      cloudProviders: cloud.cloudProviders || []
    }),
    []
  );

  return {
    initialized,
    state: snapshot,
    actions,
    backup: backupApi,
    cloud: cloudApi
  };
}
