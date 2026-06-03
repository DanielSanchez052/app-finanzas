import type { BackupData } from "../domain/types";

export type BackupFormat = "json" | "csv";

export interface LocalBackupService {
  export(data: BackupData, format: BackupFormat): Blob;

  parseFile(file: File, format: BackupFormat): Promise<BackupData>;
}

interface BackupFormatStrategy {
  type: string;
  export(data: BackupData): string;
  parse(text: string): BackupData;
}

function assertBackupDataLike(obj: any): BackupData {
  const incomes = Array.isArray(obj?.incomes) ? obj.incomes : [];
  const expenses = Array.isArray(obj?.expenses) ? obj.expenses : [];
  const budgets = Array.isArray(obj?.budgets) ? obj.budgets : [];
  return { incomes, expenses, budgets };
}

const jsonStrategy: BackupFormatStrategy = {
  type: "application/json",
  export(data: BackupData): string {
    return JSON.stringify(data, null, 2);
  },
  parse(text: string): BackupData {
    let parsed: any;
    try {
      parsed = JSON.parse(text);
    } catch {
      throw new Error("Archivo de backup JSON inválido.");
    }
    return assertBackupDataLike(parsed);
  }
};

const csvStrategy: BackupFormatStrategy = {
  type: "text/csv",
  export(data: BackupData): string {
    const sections: string[] = [];

    const toCsv = (rows: any[]): string => {
      if (!rows.length) return "";
      const headers = Object.keys(rows[0]);
      const lines = [
        headers.join(","),
        ...rows.map(r =>
          headers
            .map(h => {
              const value = r[h] ?? "";
              return JSON.stringify(String(value));
            })
            .join(",")
        )
      ];
      return lines.join("\n");
    };

    if (data.incomes.length) {
      sections.push("## incomes", toCsv(data.incomes));
    }
    if (data.expenses.length) {
      sections.push("## expenses", toCsv(data.expenses));
    }
    if (data.budgets.length) {
      sections.push("## budgets", toCsv(data.budgets));
    }

    return sections.join("\n\n");
  },
  parse(_text: string): BackupData {
    // Podríamos implementar parseo de CSV más adelante; por ahora solo soportamos exportación.
    throw new Error(
      "Importar backups en formato CSV no está soportado. Usa JSON para restaurar datos."
    );
  }
};

const backupStrategies: Record<BackupFormat, BackupFormatStrategy | undefined> = {
  json: jsonStrategy,
  csv: csvStrategy
};

export const localBackupService: LocalBackupService = {
  export(data: BackupData, format: BackupFormat): Blob {
    const strategy = backupStrategies[format];
    if (!strategy) {
      throw new Error(`Formato de backup no soportado aún: ${format}`);
    }

    const content = strategy.export(data);
    return new Blob([content], { type: strategy.type });
  },

  async parseFile(file: File, format: BackupFormat): Promise<BackupData> {
    const strategy = backupStrategies[format];
    if (!strategy) {
      throw new Error(`Formato de backup no soportado aún: ${format}`);
    }

    const text = await file.text();
    return strategy.parse(text);
  }
};

