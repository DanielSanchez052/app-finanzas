import type { Movement, Budget, BackupData } from "../domain/types";

export interface Repository {
  /**
   * Carga todos los datos persistidos (ingresos, gastos, presupuestos).
   */
  loadAll(): Promise<BackupData>;

  /**
   * Persiste un nuevo ingreso.
   */
  saveIncome(movement: Movement): Promise<void>;

  /**
   * Persiste un nuevo gasto.
   */
  saveExpense(movement: Movement): Promise<void>;

  /**
   * Elimina un ingreso por id.
   */
  deleteIncome(id: string): Promise<void>;

  /**
   * Elimina un gasto por id.
   */
  deleteExpense(id: string): Promise<void>;

  /**
   * Crea o actualiza un presupuesto para una categoría.
   */
  saveBudget(budget: Budget): Promise<void>;

  /**
   * Reemplaza completamente los datos persistidos por los del backup.
   * Útil después de un import local o desde la nube.
   */
  replaceAll(data: BackupData): Promise<void>;
}

