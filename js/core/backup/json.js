export default {
  format: "json",
  type: "application/json",
  export(data) {
    return JSON.stringify(data, null, 2);
  },
  import(file, onSuccess) {
    const reader = new FileReader();

    reader.onload = e => {
      try {
        const data = JSON.parse(e.target.result);
        if (!data.incomes || !data.expenses || !data.budgets) {
          throw new Error("Backup inválido");
        }

        onSuccess(data);
      } catch (err) {
        console.error(err);
        alert("No se pudo importar el archivo");
      }
    };

    reader.readAsText(file);
  }
}