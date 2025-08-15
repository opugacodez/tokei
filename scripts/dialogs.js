class DialogManager {
  constructor() {
    this.dialogContainer = null;
  }

  showDialog({ title, message, buttons }) {
    return new Promise((resolve) => {
      if (this.dialogContainer) {
        this.dialogContainer.remove();
      }

      this.dialogContainer = document.createElement("div");
      this.dialogContainer.className = "dialog-container";

      const buttonsHTML = buttons
        .map(
          (btn) => `
        <button class="mdc-button ${btn.class || ""}" data-action="${
            btn.action
          }">
          ${btn.label}
        </button>
      `
        )
        .join("");

      this.dialogContainer.innerHTML = `
        <div class="dialog-surface">
          <h2 class="dialog-title">${title}</h2>
          <div class="dialog-content">${message}</div>
          <div class="dialog-actions">${buttonsHTML}</div>
        </div>
      `;

      document.body.appendChild(this.dialogContainer);

      this.dialogContainer.addEventListener("click", (e) => {
        const action = e.target.closest("button")?.dataset.action;
        if (action) {
          this.closeDialog();
          resolve(action);
        }
      });
    });
  }

  showPixDialog() {
    if (this.dialogContainer) {
      this.dialogContainer.remove();
    }

    this.dialogContainer = document.createElement("div");
    this.dialogContainer.className = "dialog-container";
    const pixKey = "opugacodez@outlook.com";

    this.dialogContainer.innerHTML = `
      <div class="dialog-surface">
        <h2 class="dialog-title">Apoie o Projeto</h2>
        <div class="dialog-content">
          <p>Se você gosta do Tokei, considere fazer uma doação via PIX para apoiar o desenvolvimento.</p>
          <div class="pix-key-container">
            <input type="text" value="${pixKey}" id="pix-key-input" readonly>
            <button id="copy-pix-btn" class="mdc-button">
              <span class="material-symbols-outlined">content_copy</span>
              Copiar
            </button>
          </div>
          <p class="pix-note">Chave PIX (E-mail)</p>
        </div>
        <div class="dialog-actions">
          <button class="mdc-button" data-action="close">Fechar</button>
        </div>
      </div>
    `;

    document.body.appendChild(this.dialogContainer);

    const copyBtn = this.dialogContainer.querySelector("#copy-pix-btn");
    const pixInput = this.dialogContainer.querySelector("#pix-key-input");

    copyBtn.addEventListener("click", () => {
      navigator.clipboard.writeText(pixInput.value).then(() => {
        copyBtn.innerHTML =
          '<span class="material-symbols-outlined">check</span> Copiado!';
        setTimeout(() => {
          copyBtn.innerHTML =
            '<span class="material-symbols-outlined">content_copy</span> Copiar';
        }, 2000);
      });
    });

    this.dialogContainer.addEventListener("click", (e) => {
      const action = e.target.closest("button")?.dataset.action;
      if (action === "close") {
        this.closeDialog();
      }
    });
  }

  closeDialog() {
    if (this.dialogContainer) {
      this.dialogContainer.remove();
      this.dialogContainer = null;
    }
  }

  confirm(message, title = "Confirmação") {
    return this.showDialog({
      title,
      message,
      buttons: [
        { label: "Cancelar", action: "cancel" },
        { label: "Confirmar", action: "confirm", class: "mdc-button--raised" },
      ],
    });
  }
}
