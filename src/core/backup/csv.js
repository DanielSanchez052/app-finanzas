export default {
  format: "csv",
  type: "text/csv",
  export(data) {
    const headers = Object.keys(data[0]);
    const csv = [
      headers.join(","),
      ...data.map(r =>
        headers.map(h => `"${r[h] ?? ""}"`).join(",")
      )
    ].join("\n");

    return csv;
  },
  
  import(file, onSuccess) {
    const reader = new FileReader();

    reader.onload = e => {
      try {
        const data = e.target.result;
        if (!data) {
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