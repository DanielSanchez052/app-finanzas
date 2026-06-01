import cloud from "../../core/persistence/cloud/index.js";

export function renderStorageSettings(container){
  container.insertAdjacentHTML("beforeend", 
    ` 
    <br />
    <h2>Persistencia Datos</h2>

    <div>
      <label>Almacenamiento: </label>
      <select id="storage-medium">
        <option value="none">Ninguno</option>
        <option value="google-drive">Google Drive</option>
      </select>
    </div>
    `
  );

  const storageMedium = document.getElementById("storage-medium");

  const savedProvider = localStorage.getItem("storageProvider");
  if (savedProvider && cloud.cloudProviders.includes(savedProvider)) {
    storageMedium.value = savedProvider;
  }

  storageMedium.addEventListener("change", async (e) => {
    const value = e.target.value;

    if (value === "none") {
      localStorage.removeItem("storageProvider");
      return;
    }

    localStorage.setItem("storageProvider", value);

    try {
      await cloud.authenticate(value);
      alert(`Provider "${value}" configured correctly.`);
    } catch (err) {
      console.error(err);
      alert("Error authenticating with the selected storage provider.");
    }
  });
}