class ExportImportManager {
  constructor(taskManager, notificationManager, dialogManager) {
    this.taskManager = taskManager;
    this.notificationManager = notificationManager;
    this.dialogManager = dialogManager;
    this.modal = document.getElementById("import-export-modal");
    this.openModalBtn = document.getElementById("import-export-btn");
    this.closeModalBtn = this.modal.querySelector(".close-modal-btn");
    this.exportBtn = document.getElementById("export-tasks-btn");
    this.importBtn = document.getElementById("import-tasks-btn");
    this.fileInput = document.getElementById("file-input");

    this.init();
  }

  init() {
    this.openModalBtn.addEventListener("click", () => this.showModal());
    this.closeModalBtn.addEventListener("click", () => this.hideModal());
    this.modal.addEventListener("click", (e) => {
      if (e.target === this.modal) {
        this.hideModal();
      }
    });

    this.exportBtn.addEventListener("click", () => this.exportTasks());
    this.importBtn.addEventListener("click", () => this.fileInput.click());
    this.fileInput.addEventListener("change", (e) => this.handleFileImport(e));
  }

  showModal() {
    this.modal.classList.remove("hidden");
  }

  hideModal() {
    this.modal.classList.add("hidden");
  }

  exportTasks() {
    const tasks = this.taskManager.tasks;
    if (tasks.length === 0) {
      this.notificationManager.showLocal(
        "Nenhuma tarefa para exportar.",
        "info"
      );
      return;
    }

    const dataStr = JSON.stringify(tasks, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);

    const linkElement = document.createElement("a");
    linkElement.href = url;
    linkElement.download = `tokei-tasks-${
      new Date().toISOString().split("T")[0]
    }.json`;

    document.body.appendChild(linkElement);
    linkElement.click();
    document.body.removeChild(linkElement);
    URL.revokeObjectURL(url);

    this.notificationManager.showLocal(
      "Tarefas exportadas com sucesso!",
      "success"
    );
    this.hideModal();
  }

  handleFileImport(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const importedTasks = JSON.parse(e.target.result);
        if (!Array.isArray(importedTasks)) {
          throw new Error("O arquivo não contém uma lista de tarefas válida.");
        }

        const result = await this.dialogManager.confirm(
          `Isso substituirá suas ${this.taskManager.tasks.length} tarefas atuais por ${importedTasks.length} novas tarefas. Deseja continuar?`,
          "Confirmar Importação"
        );

        if (result === "confirm") {
          this.taskManager.tasks = importedTasks;
          this.taskManager.saveAndRender();
          this.notificationManager.showLocal(
            "Tarefas importadas com sucesso!",
            "success"
          );
          this.hideModal();
        }
      } catch (error) {
        this.notificationManager.showLocal(
          `Erro ao importar: ${error.message}`,
          "error"
        );
      } finally {
        this.fileInput.value = "";
      }
    };

    reader.onerror = () => {
      this.notificationManager.showLocal("Erro ao ler o arquivo.", "error");
    };

    reader.readAsText(file);
  }
}
