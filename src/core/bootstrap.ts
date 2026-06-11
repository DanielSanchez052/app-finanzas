import { createCoreStore } from "./state/store";
import { createAppCore } from "./app/appCore";
import type { CoreState } from "./domain/types";
import { indexedDbRepository } from "./persistence/indexedDbRepository";
import type { LocalBackupService } from "./persistence/backupLocal";
import { localBackupService } from "./persistence/backupLocal";
import type { CloudService } from "./cloud/cloudService";
import { cloudService } from "./cloud/cloudService";
import { setAppCoreInstance } from "../hooks/useAppCore";

// Estado inicial mínimo; el contenido real se cargará desde IndexedDB en initialize()
const initialCoreState: CoreState = {
  currentMonth: new Date().toISOString().slice(0, 7),
  incomes: [],
  expenses: [],
  budgets: []
};

const store = createCoreStore(initialCoreState);

const appCore = createAppCore({
  store,
  repository: indexedDbRepository,
  backupService: localBackupService,
  cloudService: cloudService
});

// Registrar la instancia global de AppCore para que useAppCore pueda consumirla
setAppCoreInstance(appCore);
