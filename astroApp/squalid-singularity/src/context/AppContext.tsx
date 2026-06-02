import React, { createContext, useContext, useState } from "react";
import type { TabId } from "../components/AppShell/AppShell";
import { useAppCore } from "../hooks/useAppCore";

// Tipos mínimos por ahora; se rellenarán al conectar con core/
export interface Budget {
  category: string;
  amount: number;
}

export interface CoreState {
  currentMonth: string;
  incomes: any[];
  expenses: any[];
  budgets: Budget[];
}

export interface CoreActions {
  addIncome: (...args: any[]) => Promise<void>;
  addExpense: (...args: any[]) => Promise<void>;
  saveBudget: (...args: any[]) => Promise<void>;
  setCurrentMonth: (month: string) => void;
}

export interface BackupAPI {
  exportData: (...args: any[]) => any;
  importData: (...args: any[]) => Promise<void>;
}

export interface CloudAPI {
  authenticate: (...args: any[]) => Promise<any>;
  saveOnCloud: (...args: any[]) => Promise<void>;
  loadFromCloud: (...args: any[]) => Promise<any>;
  cloudProviders: string[];
}

export interface AppContextValue {
  tab: TabId;
  setTab: (tab: TabId) => void;
  state: CoreState;
  actions: CoreActions;
  backup: BackupAPI;
  cloud: CloudAPI;
}

const defaultValue: AppContextValue = {
  tab: "dashboard",
  setTab: () => {},
  state: { currentMonth: new Date().toISOString().slice(0, 7), incomes: [], expenses: [], budgets: [] },
  actions: {
    addIncome: async () => {},
    addExpense: async () => {},
    saveBudget: async () => {},
    setCurrentMonth: () => {}
  },
  backup: {
    exportData: () => ({}),
    importData: async () => {}
  },
  cloud: {
    authenticate: async () => {},
    saveOnCloud: async () => {},
    loadFromCloud: async () => ({}),
    cloudProviders: []
  }
};

const AppContext = createContext<AppContextValue>(defaultValue);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [tab, setTab] = useState<TabId>("dashboard");
  const { state, actions, backup, cloud } = useAppCore();

  const value: AppContextValue = {
    tab,
    setTab,
    state,
    actions,
    backup,
    cloud
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  return useContext(AppContext);
}
