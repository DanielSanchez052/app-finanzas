import type { Movement, Budget, BackupData } from "../domain/types";
import type { Repository } from "./repository";
import { openDB, getStore } from "./db";

async function ensureDBOpened() {
  // openDB es idempotente, pero nos aseguramos de llamarlo antes de operar
  await openDB();
}

function getAllFromStore<T>(storeName: string): Promise<T[]> {
  return new Promise((resolve, reject) => {
    try {
      const req = getStore(storeName).getAll();
      req.onsuccess = () => resolve((req.result as T[]) ?? []);
      req.onerror = () => reject(req.error);
    } catch (err) {
      reject(err);
    }
  });
}

function deleteFromStore(storeName: string, key: string): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      const req = getStore(storeName, "readwrite").delete(key);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    } catch (err) {
      reject(err);
    }
  });
}

function putInStore(storeName: string, value: any): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      const req = getStore(storeName, "readwrite").put(value);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    } catch (err) {
      reject(err);
    }
  });
}

function clearStore(storeName: string): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      const req = getStore(storeName, "readwrite").clear();
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    } catch (err) {
      reject(err);
    }
  });
}

export const indexedDbRepository: Repository = {
  async loadAll(): Promise<BackupData> {
    await ensureDBOpened();
    const [incomes, expenses, budgets] = await Promise.all([
      getAllFromStore<Movement>("incomes"),
      getAllFromStore<Movement>("expenses"),
      getAllFromStore<Budget>("budgets")
    ]);

    return {
      incomes: incomes ?? [],
      expenses: expenses ?? [],
      budgets: budgets ?? []
    };
  },

  async saveIncome(movement: Movement): Promise<void> {
    await ensureDBOpened();
    await putInStore("incomes", movement);
  },

  async saveExpense(movement: Movement): Promise<void> {
    await ensureDBOpened();
    await putInStore("expenses", movement);
  },

  async deleteIncome(id: string): Promise<void> {
    await ensureDBOpened();
    await deleteFromStore("incomes", id);
  },

  async deleteExpense(id: string): Promise<void> {
    await ensureDBOpened();
    await deleteFromStore("expenses", id);
  },

  async saveBudget(budget: Budget): Promise<void> {
    await ensureDBOpened();
    await putInStore("budgets", budget);
  },

  async replaceAll(data: BackupData): Promise<void> {
    await ensureDBOpened();
    await Promise.all([
      clearStore("incomes"),
      clearStore("expenses"),
      clearStore("budgets")
    ]);
    
    await Promise.all([
      ...data.incomes.map(i => putInStore("incomes", i)),
      ...data.expenses.map(e => putInStore("expenses", e)),
      ...data.budgets.map(b => putInStore("budgets", b))
    ]);
  }
};

