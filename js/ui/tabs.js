export function initTabs() {
  const tabs = document.querySelectorAll(".tabs button");
  const contents = document.querySelectorAll("[data-tab-content]");

  function activate(tabName) {
    // Botones
    tabs.forEach(btn => {
      btn.classList.toggle(
        "active",
        btn.dataset.tab === tabName
      );
    });

    // Contenidos
    contents.forEach(section => {
      section.style.display =
        section.dataset.tabContent === tabName
          ? "block"
          : "none";
    });

    // Persistir tab activa (opcional)
    localStorage.setItem("activeTab", tabName);
  }

  // Eventos
  tabs.forEach(btn => {
    btn.addEventListener("click", () => {
      activate(btn.dataset.tab);
    });
  });

  // Tab inicial
  const savedTab =
    localStorage.getItem("activeTab") || "dashboard";

  activate(savedTab);
}
