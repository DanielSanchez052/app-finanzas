import googleDrive from "./googleDrive/index.js";
import s3 from "./s3/index.js";

const STORAGE_PROVIDER_KEY = "storageProvider";

export function getSelectedProvider() {
  return localStorage.getItem(STORAGE_PROVIDER_KEY) || "none";
}

export function setSelectedProvider(provider) {
  if (!provider || provider === "none") {
    localStorage.removeItem(STORAGE_PROVIDER_KEY);
  } else {
    localStorage.setItem(STORAGE_PROVIDER_KEY, provider);
  }
}

const providers = {
  "google-drive": googleDrive,
  "s3": s3
};

export default {
  cloudProviders: Object.keys(providers),

  async saveOnCloud(cloudProvider, backupJson) {
    const provider = providers[cloudProvider];
    if (!provider || typeof provider.uploadBackup !== "function") {
      throw new Error(`Provider not supported: ${cloudProvider}`);
    }

    // backupJson is the object { incomes, expenses, budgets }
    return provider.uploadBackup(backupJson);
  },

  async loadFromCloud(cloudProvider) {
    const provider = providers[cloudProvider];
    if (!provider || typeof provider.downloadBackup !== "function") {
      throw new Error(`Provider not supported: ${cloudProvider}`);
    }

    // Must return an object { incomes, expenses, budgets }
    return provider.downloadBackup();
  },

  async authenticate(cloudProvider) {
    const provider = providers[cloudProvider];
    if (!provider || typeof provider.authenticate !== "function") {
      throw new Error(`Provider not supported: ${cloudProvider}`);
    }

    return provider.authenticate();
  }
};
