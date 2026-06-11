import type { BackupData } from "../domain/types";
import type { CloudProviderId, CloudProviderUser } from "./types";
import cloudJs, {
  getSelectedProvider as getSelectedProviderJs,
  setSelectedProvider as setSelectedProviderJs
} from "./providers/index.js";

export interface CloudService {
  getSelectedProvider(): CloudProviderId | "none";
  setSelectedProvider(id: CloudProviderId | "none"): void;

  authenticate(): Promise<CloudProviderUser>;

  saveOnCloud(data: BackupData): Promise<void>;

  loadFromCloud(): Promise<BackupData>;
}

export const cloudService: CloudService = {
  getSelectedProvider(): CloudProviderId | "none" {
    return (getSelectedProviderJs() as CloudProviderId | "none") ?? "none";
  },

  setSelectedProvider(id: CloudProviderId | "none"): void {
    setSelectedProviderJs(id === "none" ? "none" : id);
  },

  async authenticate(): Promise<CloudProviderUser> {
    const providerId = this.getSelectedProvider();
    if (providerId === "none") {
      throw new Error("No hay proveedor de nube seleccionado.");
    }

    const result: any = await cloudJs.authenticate(providerId);
    const email: string = result?.user?.email || "desconocido";
    return { email };
  },

  async saveOnCloud(data: BackupData): Promise<void> {
    const providerId = this.getSelectedProvider();
    if (providerId === "none") {
      throw new Error("No hay proveedor de nube seleccionado.");
    }

    await cloudJs.saveOnCloud(providerId, data);
  },

  async loadFromCloud(): Promise<BackupData> {
    const providerId = this.getSelectedProvider();
    if (providerId === "none") {
      throw new Error("No hay proveedor de nube seleccionado.");
    }

    const result: any = await cloudJs.loadFromCloud(providerId);
    // Se asume que el módulo JS ya devuelve un objeto con incomes, expenses, budgets
    return {
      incomes: Array.isArray(result?.incomes) ? result.incomes : [],
      expenses: Array.isArray(result?.expenses) ? result.expenses : [],
      budgets: Array.isArray(result?.budgets) ? result.budgets : []
    };
  }
};

