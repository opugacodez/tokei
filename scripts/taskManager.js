class TaskManager {
  constructor() {
    this.tasks = [];
    this.currentEditId = null;
    this.notificationCheckInterval = null;
    this.init();
  }

  init() {
    this.loadTasks();
    this.renderTasks();
    this.setupEventListeners();
    this.startNotificationChecker();
    this.requestNotificationPermission();
  }

  setupEventListeners() {
    // Eventos do formulário
    document
      .getElementById("add-task")
      .addEventListener("click", () => this.showTaskForm());
    document
      .getElementById("cancel-task")
      .addEventListener("click", () => this.hideTaskForm());
    document
      .getElementById("task-form")
      .addEventListener("submit", (e) => this.handleFormSubmit(e));

    // Event delegation para ações das tarefas
    document.getElementById("tasks-list").addEventListener("click", (e) => {
      const taskElement = e.target.closest(".task-item");
      if (!taskElement) return;

      const taskId = taskElement.dataset.id;
      const target = e.target.closest("button");

      if (!target) return;

      if (target.classList.contains("edit-task")) {
        const task = this.tasks.find((t) => t.id === taskId);
        this.showTaskForm(task);
      } else if (target.classList.contains("delete-task")) {
        this.confirmDeleteTask(taskId);
      } else if (target.classList.contains("complete-task")) {
        this.toggleTaskCompletion(taskId);
      }
    });

    // Eventos de importação/exportação
    document
      .getElementById("export-tasks")
      .addEventListener("click", () => this.exportTasks());
    document.getElementById("import-tasks").addEventListener("click", () => {
      document.getElementById("file-input").click();
    });
    document
      .getElementById("file-input")
      .addEventListener("change", (e) => this.handleFileImport(e));
  }

  startNotificationChecker() {
    // Limpar intervalo existente
    if (this.notificationCheckInterval) {
      clearInterval(this.notificationCheckInterval);
    }

    // Verificar tarefas a cada minuto
    this.notificationCheckInterval = setInterval(() => {
      this.checkTasksForNotifications();
    }, 60000);

    // Verificar imediatamente ao iniciar
    this.checkTasksForNotifications();
  }

  requestNotificationPermission() {
    if ("Notification" in window && Notification.permission !== "denied") {
      Notification.requestPermission().then((permission) => {
        console.log("Status da permissão de notificação:", permission);
      });
    }
  }

  showTaskForm(task = null) {
    const formContainer = document.getElementById("task-form-container");
    const form = document.getElementById("task-form");

    if (task) {
      // Modo edição
      form.elements["task-title"].value = task.title;
      form.elements["task-description"].value = task.description || "";
      form.elements["task-date"].value = task.date;
      form.elements["task-time"].value = task.time;
      form.elements["task-id"].value = task.id;
      this.currentEditId = task.id;
    } else {
      // Modo criação
      form.reset();
      const today = new Date().toISOString().split("T")[0];
      const now = new Date().toTimeString().substring(0, 5);
      form.elements["task-date"].value = today;
      form.elements["task-time"].value = now;
      this.currentEditId = null;
    }

    formContainer.classList.remove("hidden");
    form.elements["task-title"].focus();
  }

  hideTaskForm() {
    document.getElementById("task-form-container").classList.add("hidden");
    document.getElementById("task-form").reset();
    this.currentEditId = null;
  }

  handleFormSubmit(e) {
    e.preventDefault();

    const form = e.target;
    const title = form.elements["task-title"].value.trim();
    const description = form.elements["task-description"].value.trim();
    const date = form.elements["task-date"].value;
    const time = form.elements["task-time"].value;
    const taskId = form.elements["task-id"].value;

    if (!title || !date || !time) {
      this.showNotification("Preencha todos os campos obrigatórios", "error");
      return;
    }

    const taskData = {
      id: taskId || this.generateTaskId(),
      title,
      description,
      date,
      time,
      completed: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (this.currentEditId) {
      this.updateTask(taskData);
    } else {
      this.addTask(taskData);
    }
  }

  generateTaskId() {
    return Date.now().toString() + Math.floor(Math.random() * 1000).toString();
  }

  addTask(task) {
    // Verificar se já existe tarefa com mesmo título e horário
    const duplicate = this.tasks.some(
      (t) =>
        t.title === task.title && t.date === task.date && t.time === task.time
    );

    if (duplicate) {
      this.showNotification(
        "Já existe uma tarefa com este título e horário",
        "error"
      );
      return;
    }

    this.tasks.push(task);
    this.saveAndUpdateUI();
    this.showNotification("Tarefa adicionada com sucesso!");
  }

  updateTask(updatedTask) {
    const index = this.tasks.findIndex((t) => t.id === updatedTask.id);

    if (index === -1) {
      this.showNotification("Tarefa não encontrada para atualização", "error");
      return;
    }

    this.tasks[index] = updatedTask;
    this.saveAndUpdateUI();
    this.showNotification("Tarefa atualizada com sucesso!");
  }

  confirmDeleteTask(taskId) {
    const task = this.tasks.find((t) => t.id === taskId);
    if (!task) return;

    const modal = document.createElement("div");
    modal.className = "confirmation-modal";
    modal.innerHTML = `
      <div class="modal-content">
        <h3>Confirmar exclusão</h3>
        <p>Tem certeza que deseja excluir a tarefa "${task.title}"?</p>
        <div class="modal-actions">
          <button class="mdc-button cancel-delete">Cancelar</button>
          <button class="mdc-button mdc-button--raised confirm-delete">Excluir</button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    modal.querySelector(".cancel-delete").addEventListener("click", () => {
      document.body.removeChild(modal);
    });

    modal.querySelector(".confirm-delete").addEventListener("click", () => {
      this.deleteTask(taskId);
      document.body.removeChild(modal);
    });
  }

  deleteTask(taskId) {
    this.tasks = this.tasks.filter((task) => task.id !== taskId);
    this.saveAndUpdateUI();
    this.showNotification("Tarefa removida com sucesso!");
  }

  toggleTaskCompletion(taskId) {
    const index = this.tasks.findIndex((t) => t.id === taskId);
    if (index === -1) return;

    this.tasks[index] = {
      ...this.tasks[index],
      completed: !this.tasks[index].completed,
      updatedAt: new Date().toISOString(),
    };

    this.saveAndUpdateUI();
  }

  saveAndUpdateUI() {
    this.saveTasks();
    this.renderTasks();
    this.checkTasksForNotifications();
  }

  renderTasks() {
    const tasksList = document.getElementById("tasks-list");

    if (this.tasks.length === 0) {
      tasksList.innerHTML =
        '<p class="no-tasks">Nenhuma tarefa cadastrada.</p>';
      return;
    }

    // Ordenar tarefas: não completadas primeiro, depois por data/hora
    const sortedTasks = [...this.tasks].sort((a, b) => {
      if (a.completed !== b.completed) {
        return a.completed ? 1 : -1;
      }

      const dateA = new Date(`${a.date}T${a.time}`);
      const dateB = new Date(`${b.date}T${b.time}`);
      return dateA - dateB;
    });

    tasksList.innerHTML = sortedTasks
      .map((task) => this.createTaskElement(task))
      .join("");
  }

  createTaskElement(task) {
    const dueDate = new Date(`${task.date}T${task.time}`);
    const now = new Date();
    const isOverdue = !task.completed && dueDate < now;
    const isDueSoon =
      !task.completed && !isOverdue && dueDate - now < 30 * 60 * 1000; // 30 minutos

    return `
      <div class="task-item ${task.completed ? "completed" : ""}" data-id="${
      task.id
    }">
        <div class="task-header">
          <div class="task-title">${task.title}</div>
          <div class="task-actions">
            <button class="task-button edit-task">
              <span class="material-symbols-outlined">edit</span>
            </button>
            <button class="task-button delete-task">
              <span class="material-symbols-outlined">delete</span>
            </button>
            <button class="task-button complete-task">
              <span class="material-symbols-outlined">
                ${task.completed ? "check_circle" : "radio_button_unchecked"}
              </span>
            </button>
          </div>
        </div>
        ${
          task.description
            ? `<div class="task-description">${task.description}</div>`
            : ""
        }
        <div class="task-datetime ${isOverdue ? "task-due" : ""} ${
      isDueSoon ? "task-due-soon" : ""
    }">
          <span>${this.formatDate(task.date)} • ${task.time}</span>
          ${isOverdue ? "<span>Atrasada</span>" : ""}
          ${isDueSoon ? "<span>Em breve</span>" : ""}
        </div>
      </div>
    `;
  }

  checkTasksForNotifications() {
    if (!("Notification" in window)) return;

    const now = new Date();
    const soon = new Date(now.getTime() + 15 * 60 * 1000); // 15 minutos no futuro

    this.tasks.forEach((task) => {
      if (task.completed) return;

      const taskTime = new Date(`${task.date}T${task.time}`);

      // Notificar se a tarefa está para começar em 15 minutos
      if (taskTime > now && taskTime <= soon) {
        this.showNotification(`Tarefa próxima: ${task.title} às ${task.time}`);
        this.showSystemNotification(
          "Tarefa próxima",
          `${task.title} começa às ${task.time}`
        );
      }

      // Notificar se a tarefa está atrasada
      if (taskTime < now && now - taskTime < 24 * 60 * 60 * 1000) {
        this.showNotification(`Tarefa atrasada: ${task.title}`, "error");
        this.showSystemNotification(
          "Tarefa atrasada",
          `${task.title} deveria ter começado às ${task.time}`
        );
      }
    });
  }

  showNotification(message, type = "info") {
    const notification = document.getElementById("notification");
    if (!notification) return;

    notification.textContent = message;
    notification.className = `notification ${type}`;
    notification.classList.remove("hidden");

    setTimeout(() => {
      notification.classList.add("hidden");
    }, 5000);
  }

  showSystemNotification(title, body) {
    if ("Notification" in window && Notification.permission === "granted") {
      const options = {
        body,
        icon: "/assets/icons/icon-192x192.png",
        badge: "/assets/icons/badge-72x72.png",
      };

      // Verificar se já existe notificação igual para evitar duplicatas
      navigator.serviceWorker.getRegistration().then((reg) => {
        if (!reg) return;

        reg.getNotifications().then((notifs) => {
          const alreadyShown = notifs.some(
            (n) => n.title === title && n.body === body
          );

          if (!alreadyShown) {
            reg.showNotification(title, options);
          }
        });
      });
    }
  }

  loadTasks() {
    try {
      const savedTasks = localStorage.getItem("tasks");
      this.tasks = savedTasks ? JSON.parse(savedTasks) : [];
    } catch (error) {
      console.error("Erro ao carregar tarefas:", error);
      this.tasks = [];
    }
  }

  saveTasks() {
    try {
      localStorage.setItem("tasks", JSON.stringify(this.tasks));
    } catch (error) {
      console.error("Erro ao salvar tarefas:", error);
      this.showNotification("Erro ao salvar tarefas", "error");
    }
  }

  exportTasks() {
    try {
      const dataStr = JSON.stringify(this.tasks, null, 2);
      const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(
        dataStr
      )}`;

      const exportName = `tasks-${new Date().toISOString().split("T")[0]}.json`;
      const linkElement = document.createElement("a");

      linkElement.setAttribute("href", dataUri);
      linkElement.setAttribute("download", exportName);
      linkElement.click();

      this.showNotification("Tarefas exportadas com sucesso!");
    } catch (error) {
      console.error("Erro ao exportar tarefas:", error);
      this.showNotification("Erro ao exportar tarefas", "error");
    }
  }

  handleFileImport(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const tasks = JSON.parse(e.target.result);
        if (!Array.isArray(tasks)) {
          throw new Error("Formato de arquivo inválido");
        }

        const modal = document.createElement("div");
        modal.className = "confirmation-modal";
        modal.innerHTML = `
          <div class="modal-content">
            <h3>Confirmar importação</h3>
            <p>Deseja importar ${tasks.length} tarefas? Isso substituirá suas tarefas atuais.</p>
            <div class="modal-actions">
              <button class="mdc-button cancel-import">Cancelar</button>
              <button class="mdc-button mdc-button--raised confirm-import">Importar</button>
            </div>
          </div>
        `;

        document.body.appendChild(modal);

        modal.querySelector(".cancel-import").addEventListener("click", () => {
          document.body.removeChild(modal);
          event.target.value = "";
        });

        modal.querySelector(".confirm-import").addEventListener("click", () => {
          this.tasks = tasks;
          this.saveAndUpdateUI();
          this.showNotification(
            `${tasks.length} tarefas importadas com sucesso!`
          );
          document.body.removeChild(modal);
          event.target.value = "";
        });
      } catch (error) {
        console.error("Erro ao importar tarefas:", error);
        this.showNotification(
          "Erro ao importar tarefas: " + error.message,
          "error"
        );
        event.target.value = "";
      }
    };
    reader.readAsText(file);
  }

  formatDate(dateString) {
    const options = { weekday: "short", day: "numeric", month: "short" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  }
}

// Inicializar quando o DOM estiver pronto
document.addEventListener("DOMContentLoaded", () => {
  window.taskManager = new TaskManager();
});
