class TaskExporter {
  static exportTasks(tasks) {
    const dataStr = JSON.stringify(tasks, null, 2);
    const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(
      dataStr
    )}`;

    const exportName = `tasks-${new Date().toISOString().split("T")[0]}.json`;
    const linkElement = document.createElement("a");

    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", exportName);
    linkElement.click();

    showNotification("Tarefas exportadas com sucesso!");
  }

  static importTasks(file, callback) {
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const tasks = JSON.parse(event.target.result);
        if (Array.isArray(tasks)) {
          callback(tasks);
          showNotification("Tarefas importadas com sucesso!");
        } else {
          showNotification("Formato de arquivo inválido", "error");
        }
      } catch (error) {
        showNotification("Erro ao importar tarefas: " + error.message, "error");
      }
    };

    reader.onerror = () => {
      showNotification("Erro ao ler o arquivo", "error");
    };

    reader.readAsText(file);
  }
}

// Initialize export/import functionality
document.addEventListener("DOMContentLoaded", () => {
  const importExportButton = document.getElementById("import-export");
  const modal = document.getElementById("import-export-modal");
  const closeModal = document.querySelector(".close-modal");
  const exportButton = document.getElementById("export-tasks");
  const importButton = document.getElementById("import-tasks");
  const fileInput = document.getElementById("file-input");

  importExportButton.addEventListener("click", () => {
    modal.classList.remove("hidden");
  });

  closeModal.addEventListener("click", () => {
    modal.classList.add("hidden");
  });

  exportButton.addEventListener("click", () => {
    TaskExporter.exportTasks(taskManager.tasks);
    modal.classList.add("hidden");
  });

  importButton.addEventListener("click", () => {
    fileInput.click();
  });

  fileInput.addEventListener("change", (e) => {
    if (e.target.files.length > 0) {
      if (
        confirm("Importar tarefas substituirá suas tarefas atuais. Continuar?")
      ) {
        TaskExporter.importTasks(e.target.files[0], (tasks) => {
          taskManager.tasks = tasks;
          taskManager.saveTasks();
          taskManager.renderTasks();
          modal.classList.add("hidden");
        });
      }
      fileInput.value = ""; // Reset input
    }
  });

  // Close modal when clicking outside
  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      modal.classList.add("hidden");
    }
  });
});
