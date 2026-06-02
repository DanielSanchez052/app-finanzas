const DB_NAME = "finanzas-db";
const DB_VERSION = 1;

let db = null;

export function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = e => {
      const db = e.target.result;

      if (!db.objectStoreNames.contains("incomes")) {
        db.createObjectStore("incomes", {
          keyPath: "id",
          autoIncrement: true
        });
      }

      if (!db.objectStoreNames.contains("expenses")) {
        db.createObjectStore("expenses", {
          keyPath: "id",
          autoIncrement: true
        });
      }

      if (!db.objectStoreNames.contains("budgets")) {
        db.createObjectStore("budgets", {
          keyPath: "category"
        });
      }
    };

    request.onsuccess = () => {
      db = request.result;
      resolve(db);
    };

    request.onerror = () => reject(request.error);
  });
}

export function getStore(name, mode = "readonly") {
  return db.transaction(name, mode).objectStore(name);
}
