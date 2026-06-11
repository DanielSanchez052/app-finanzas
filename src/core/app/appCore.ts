import type {
  CoreState,
  Alert,
  TopBudgetItem,
  Budget,
  Movement
} from "../domain/types";
import type { CloudProviderId, CloudProviderUser } from "../cloud/types";
import type { CoreStore } from "../state/store";
import type { Repository } from "../persistence/repository";
import type { LocalBackupService } from "../persistence/backupLocal";
import type { CloudService } from "../cloud/cloudService";
import { calculateAlerts } from "../domain/alerts";
import { getTopBudgets as getTopBudgetsFromState } from "../domain/budgets";

export interface NewMovementInput {
  description: string;
  category: string;
  amount: number;
  type: "income" | "expense";
  month: string;
  date: string;
}

export type NewIncomeInput = Omit<NewMovementInput, "type">;
export type NewExpenseInput = Omit<NewMovementInput, "type">;

export interface AppCore {
  // Ciclo de vida / carga inicial
  initialize(): Promise<void>;
  reload(): Promise<void>;

  // Estado y suscripción
  getState(): CoreState;
  subscribe(listener: (state: CoreState) => void): () => void;

  // Acciones de dominio
  addMovement(input: NewMovementInput): Promise<void>;
  addIncome(input: NewIncomeInput): Promise<void>;
  addExpense(input: NewExpenseInput): Promise<void>;
  updateMovement(movement: Movement): Promise<void>;
  updateIncome(movement: Movement): Promise<void>;
  updateExpense(movement: Movement): Promise<void>;
  deleteMovement(id: string, type: "income" | "expense"): Promise<void>;
  deleteIncome(id: string): Promise<void>;
  deleteExpense(id: string): Promise<void>;
  saveBudget(budget: Budget): Promise<void>;
  setCurrentMonth(month: string): void;
  clearLocalData(): Promise<void>;

  // Consultas derivadas
  getAlerts(): Alert[];
  getTopBudgets(limit?: number): TopBudgetItem[];

  // Backup local
  backup: {
    exportData(format: "json" | "csv", section: "all" | "incomes" | "expenses" | "budgets"): Blob;
    importData(file: File, format: "json" | "csv", section: "all" | "incomes" | "expenses" | "budgets"): Promise<void>;
  };

  // Cloud
  cloud: {
    getSelectedProvider(): CloudProviderId | "none";
    setSelectedProvider(id: CloudProviderId | "none"): void;
    authenticate(): Promise<CloudProviderUser>;
    saveOnCloud(): Promise<void>;
    loadFromCloud(): Promise<void>;
  };
}

export interface AppCoreDeps {
  store: CoreStore;
  repository: Repository;
  backupService: LocalBackupService;
  cloudService: CloudService;
}

export function createAppCore(deps: AppCoreDeps): AppCore {
  const { store, repository, backupService, cloudService } = deps;

  async function initialize() {
    const data = await repository.loadAll();
    store.setState(prev => ({
      ...prev,
      incomes: data.incomes,
      expenses: data.expenses,
      budgets: data.budgets
    }));
  }

  async function reload() {
    await initialize();
  }

  function getState(): CoreState {
    return store.getState();
  }

  function subscribe(listener: (state: CoreState) => void) {
    return store.subscribe(listener);
  }

  async function addMovement(input: NewMovementInput): Promise<void> {
    const now = new Date();
    const movement = {
      id: String(now.getTime()),
      type: input.type,
      description: input.description.trim(),
      category: input.category.trim(),
      amount: input.amount,
      month: input.month,
      date: input.date,
      createdAt: now.toISOString()
    };

    if (!movement.description || !movement.category || !movement.amount) {
      throw new Error("Movimiento inválido: faltan campos requeridos.");
    }

    if (movement.type === "income") {
      await repository.saveIncome(movement);
      store.setState(prev => ({
        ...prev,
        incomes: [...prev.incomes, movement]
      }));
    } else {
      await repository.saveExpense(movement);
      store.setState(prev => ({
        ...prev,
        expenses: [...prev.expenses, movement]
      }));
    }
  }

  async function addIncome(input: NewIncomeInput): Promise<void> {
    return addMovement({ ...input, type: "income" });
  }

  async function addExpense(input: NewExpenseInput): Promise<void> {
    return addMovement({ ...input, type: "expense" });
  }

  async function updateMovement(movement: Movement): Promise<void> {
    if (!movement.id) {
      throw new Error("Movimiento inválido: falta id para actualizar.");
    }

    const normalized: Movement = {
      ...movement,
      description: movement.description.trim(),
      category: movement.category.trim()
    };

    if (!normalized.description || !normalized.category || !normalized.amount) {
      throw new Error("Movimiento inválido: faltan campos requeridos.");
    }

    if (normalized.type === "income") {
      await repository.saveIncome(normalized);
      store.setState(prev => ({
        ...prev,
        incomes: prev.incomes.map(m => (m.id === normalized.id ? normalized : m))
      }));
    } else {
      await repository.saveExpense(normalized);
      store.setState(prev => ({
        ...prev,
        expenses: prev.expenses.map(m => (m.id === normalized.id ? normalized : m))
      }));
    }
  }

  async function updateIncome(movement: Movement): Promise<void> {
    return updateMovement({ ...movement, type: "income" });
  }

  async function updateExpense(movement: Movement): Promise<void> {
    return updateMovement({ ...movement, type: "expense" });
  }

  async function deleteMovement(id: string, type: "income" | "expense"): Promise<void> {
    const normalizedId = String(id);
    if (!normalizedId) return;

    if (type === "income") {
      await repository.deleteIncome(normalizedId);
      store.setState(prev => ({
        ...prev,
        incomes: prev.incomes.filter(m => m.id !== normalizedId)
      }));
    } else {
      await repository.deleteExpense(normalizedId);
      store.setState(prev => ({
        ...prev,
        expenses: prev.expenses.filter(m => m.id !== normalizedId)
      }));
    }
  }

  async function deleteIncome(id: string): Promise<void> {
    return deleteMovement(id, "income");
  }

  async function deleteExpense(id: string): Promise<void> {
    return deleteMovement(id, "expense");
  }

  async function saveBudget(budget: Budget): Promise<void> {
    const normalized: Budget = {
      category: budget.category.trim(),
      amount: budget.amount
    };

    if (!normalized.category || !normalized.amount) {
      throw new Error("Presupuesto inválido: faltan categoría o monto.");
    }

    await repository.saveBudget(normalized);
    store.setState(prev => {
      const existing = prev.budgets.filter(b => b.category !== normalized.category);
      return {
        ...prev,
        budgets: [...existing, normalized]
      };
    });
  }

  function setCurrentMonth(month: string): void {
    const normalized = month.trim();
    if (!normalized) return;
    store.setState(prev => ({ ...prev, currentMonth: normalized }));
  }

  async function clearLocalData(): Promise<void> {
    const empty = { incomes: [], expenses: [], budgets: [] };
    await repository.replaceAll(empty);
    store.setState(prev => ({
      ...prev,
      incomes: [],
      expenses: [],
      budgets: []
    }));
  }

  function getAlerts(): Alert[] {
    return calculateAlerts(store.getState());
  }

  function getTopBudgets(limit?: number): TopBudgetItem[] {
    return getTopBudgetsFromState(store.getState(), limit);
  }

  const backup = {
    exportData(
      format: "json" | "csv",
      section: "all" | "incomes" | "expenses" | "budgets"
    ): Blob {
      const state = store.getState();
      const data = selectBackupSection(state, section);
      return backupService.export(data, format);
    },

    async importData(
      file: File,
      format: "json" | "csv",
      section: "all" | "incomes" | "expenses" | "budgets"
    ): Promise<void> {
      const imported = await backupService.parseFile(file, format);
      const current = store.getState();
      const merged = mergeBackup(current, imported, section);
      await repository.replaceAll(merged);
      store.setState(prev => ({
        ...prev,
        incomes: merged.incomes,
        expenses: merged.expenses,
        budgets: merged.budgets
      }));
    }
  };

  const cloud = {
    getSelectedProvider(): CloudProviderId | "none" {
      return cloudService.getSelectedProvider();
    },

    setSelectedProvider(id: CloudProviderId | "none"): void {
      cloudService.setSelectedProvider(id);
    },

    authenticate(): Promise<CloudProviderUser> {
      return cloudService.authenticate();
    },

    async saveOnCloud(): Promise<void> {
      const state = store.getState();
      await cloudService.saveOnCloud({
        incomes: state.incomes,
        expenses: state.expenses,
        budgets: state.budgets
      });
    },

    async loadFromCloud(): Promise<void> {
      const backupData = await cloudService.loadFromCloud();

      await repository.replaceAll(backupData);
      store.setState(prev => ({
        ...prev,
        incomes: backupData.incomes,
        expenses: backupData.expenses,
        budgets: backupData.budgets
      }));
    }
  };

  return {
    initialize,
    reload,
    getState,
    subscribe,
    addMovement,
    addIncome,
    addExpense,
    updateMovement,
    updateIncome,
    updateExpense,
    deleteMovement,
    deleteIncome,
    deleteExpense,
    saveBudget,
    clearLocalData,
    setCurrentMonth,
    getAlerts,
    getTopBudgets,
    backup,
    cloud
  };
}

// Helpers internos

function selectBackupSection(
  state: CoreState,
  section: "all" | "incomes" | "expenses" | "budgets"
) {
  switch (section) {
    case "incomes":
      return { incomes: state.incomes, expenses: [], budgets: [] };
    case "expenses":
      return { incomes: [], expenses: state.expenses, budgets: [] };
    case "budgets":
      return { incomes: [], expenses: [], budgets: state.budgets };
    case "all":
    default:
      return {
        incomes: state.incomes,
        expenses: state.expenses,
        budgets: state.budgets
      };
  }
}

function mergeBackup(
  current: CoreState,
  imported: { incomes: any[]; expenses: any[]; budgets: Budget[] },
  section: "all" | "incomes" | "expenses" | "budgets"
): { incomes: any[]; expenses: any[]; budgets: Budget[] } {
  switch (section) {
    case "incomes":
      return {
        incomes: imported.incomes,
        expenses: current.expenses,
        budgets: current.budgets
      };
    case "expenses":
      return {
        incomes: current.incomes,
        expenses: imported.expenses,
        budgets: current.budgets
      };
    case "budgets":
      return {
        incomes: current.incomes,
        expenses: current.expenses,
        budgets: imported.budgets
      };
    case "all":
    default:
      return {
        incomes: imported.incomes,
        expenses: imported.expenses,
        budgets: imported.budgets
      };
  }
}


