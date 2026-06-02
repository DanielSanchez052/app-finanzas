import React from "react";
import { AppProvider, useAppContext } from "../../context/AppContext";
import BudgetsView from "../views/BudgetsView";
import DashboardView from "../views/DashboardView";
import RegisterView from "../views/RegisterView";
import SettingsView from "../views/SettingsView";

export type TabId = "dashboard" | "register" | "budgets" | "settings";

function TabsBar({ tab, onChange }: { tab: TabId; onChange: (t: TabId) => void }) {
  const tabs: { id: TabId; label: string }[] = [
    { id: "dashboard", label: "Dashboard" },
    { id: "register", label: "Registro" },
    { id: "budgets", label: "Presupuestos" },
    { id: "settings", label: "Configuración" }
  ];

  return (
    <nav className="flex gap-2 border-b border-slate-800 mb-4">
      {tabs.map((t) => (
        <button
          key={t.id}
          onClick={() => onChange(t.id)}
          className={`px-3 py-2 text-sm rounded-t-md border-b-2 transition-colors ${
            tab === t.id
              ? "border-emerald-400 text-emerald-300 bg-slate-900"
              : "border-transparent text-slate-300 hover:text-white hover:border-slate-500"
          }`}
        >
          {t.label}
        </button>
      ))}
    </nav>
  );
}

function AppShellInner() {
  const { tab, setTab, state, actions } = useAppContext();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="max-w-5xl mx-auto px-4 py-6">
        <header className="mb-4 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold mb-2">Control Financiero Personal</h1>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <label htmlFor="month" className="text-slate-300">
              Mes:
            </label>
            <input
              id="month"
              type="month"
              value={state.currentMonth}
              onChange={e => actions.setCurrentMonth(e.target.value)}
              className="bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs text-slate-100"
            />
          </div>
        </header>

        <TabsBar tab={tab} onChange={setTab} />

        <main className="mt-4">
          {tab === "dashboard" && <DashboardView />}
          {tab === "register" && <RegisterView />}
          {tab === "budgets" && <BudgetsView />}
          {tab === "settings" && <SettingsView />}
        </main>
      </div>
    </div>
  );
}

export default function AppShell() {
  return (
    <AppProvider>
      <AppShellInner />
    </AppProvider>
  );
}
