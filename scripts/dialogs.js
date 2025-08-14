class DialogManager {
  constructor() {
    this.dialogContainer = document.createElement("div");
    this.dialogContainer.className = "dialog-container hidden";
    document.body.appendChild(this.dialogContainer);
  }

  showDialog(options) {
    return new Promise((resolve) => {
      const { title, message, buttons } = options;

      const dialogHTML = `
        <div class="mdc-dialog">
          <div class="mdc-dialog__container">
            <div class="mdc-dialog__surface">
              <h2 class="mdc-dialog__title">${title}</h2>
              <div class="mdc-dialog__content">${message}</div>
              <div class="mdc-dialog__actions">
                ${buttons
                  .map(
                    (btn) => `
                  <button class="mdc-button dialog-button" data-action="${btn.action}">
                    <span class="mdc-button__label">${btn.label}</span>
                  </button>
                `
                  )
                  .join("")}
              </div>
            </div>
          </div>
          <div class="mdc-dialog__scrim"></div>
        </div>
      `;

      this.dialogContainer.innerHTML = dialogHTML;
      this.dialogContainer.classList.remove("hidden");

      // Adicionar event listeners aos botões
      document.querySelectorAll(".dialog-button").forEach((button) => {
        button.addEventListener("click", () => {
          this.dialogContainer.classList.add("hidden");
          resolve(button.getAttribute("data-action"));
        });
      });
    });
  }

  confirm(message) {
    return this.showDialog({
      title: "Confirmação",
      message,
      buttons: [
        { label: "Cancelar", action: "cancel" },
        { label: "Confirmar", action: "confirm" },
      ],
    });
  }

  alert(message) {
    return this.showDialog({
      title: "Aviso",
      message,
      buttons: [{ label: "OK", action: "ok" }],
    });
  }
}

// Inicializar o gerenciador de diálogos
document.addEventListener("DOMContentLoaded", () => {
  window.dialogManager = new DialogManager();
});
