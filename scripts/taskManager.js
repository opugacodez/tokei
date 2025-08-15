class TaskManager {
  constructor(notificationManager, dialogManager) {
    this.notificationManager = notificationManager;
    this.dialogManager = dialogManager;
    this.tasksListElement = document.getElementById("tasks-list");
    this.taskFormContainer = document.getElementById("task-form-container");
    this.taskForm = document.getElementById("task-form");
    this.addTaskBtn = document.getElementById("add-task-btn");
    this.cancelTaskBtn = document.getElementById("cancel-task-btn");
    this.searchInput = document.getElementById("search-tasks");
    this.sortSelect = document.getElementById("sort-tasks");
    this.tasks = this.loadTasks();
    this.currentEditId = null;
    this.notificationTimeout = null;
    this.searchTerm = "";
    this.sortOrder = "date-asc";
    this.broadcastChannel = new BroadcastChannel("tokei-task-updates");

    this.init();
  }

  async init() {
    this.renderTasks();
    this.setupEventListeners();
    await this.notificationManager.requestSystemPermission();
    this.scheduleNextNotification();
  }

  setupEventListeners() {
    this.addTaskBtn.addEventListener("click", () => this.showTaskForm());
    this.cancelTaskBtn.addEventListener("click", () => this.hideTaskForm());

    this.taskForm.addEventListener("submit", (e) => this.handleFormSubmit(e));

    this.tasksListElement.addEventListener("click", (e) => {
      const button = e.target.closest("[data-action]");
      if (!button) return;

      const action = button.dataset.action;
      const taskId = button.closest(".task-item").dataset.id;

      const actions = {
        "edit-task": () => this.editTask(taskId),
        "delete-task": () => this.confirmDeleteTask(taskId),
        "toggle-complete": () => this.toggleTaskCompletion(taskId),
      };

      if (actions[action]) {
        actions[action]();
      }
    });

    this.searchInput.addEventListener("input", (e) => {
      this.searchTerm = e.target.value.toLowerCase();
      this.renderTasks();
    });

    this.sortSelect.addEventListener("change", (e) => {
      this.sortOrder = e.target.value;
      this.renderTasks();
    });

    this.broadcastChannel.onmessage = () => {
      console.log("Mensagem recebida do Broadcast Channel. Atualizando UI...");
      this.tasks = this.loadTasks();
      this.renderTasks();
      this.scheduleNextNotification();
    };
  }

  showTaskForm(task = null) {
    this.taskForm.reset();
    if (task) {
      this.taskForm.elements["task-id"].value = task.id;
      this.taskForm.elements["task-title"].value = task.title;
      this.taskForm.elements["task-description"].value = task.description || "";
      this.taskForm.elements["task-date"].value = task.date;
      this.taskForm.elements["task-time"].value = task.time;
      this.currentEditId = task.id;
    } else {
      const now = new Date();
      this.taskForm.elements["task-date"].value = now
        .toISOString()
        .split("T")[0];
      this.taskForm.elements["task-time"].value = now
        .toTimeString()
        .substring(0, 5);
      this.currentEditId = null;
    }
    this.taskFormContainer.classList.remove("hidden");
    this.taskForm.elements["task-title"].focus();
  }

  hideTaskForm() {
    this.taskFormContainer.classList.add("hidden");
    this.currentEditId = null;
  }

  handleFormSubmit(e) {
    e.preventDefault();
    const formData = new FormData(this.taskForm);
    const taskData = {
      id: formData.get("task-id") || `task_${Date.now()}`,
      title: (formData.get("task-title") || "").trim(),
      description: (formData.get("task-description") || "").trim(),
      date: formData.get("task-date"),
      time: formData.get("task-time"),
      completed: false,
      notified: false,
    };

    if (this.currentEditId) {
      const index = this.tasks.findIndex((t) => t.id === this.currentEditId);
      if (index !== -1) {
        taskData.completed = this.tasks[index].completed;
        this.tasks[index] = taskData;
        this.notificationManager.showLocal(
          "Tarefa atualizada com sucesso!",
          "success"
        );
      }
    } else {
      this.tasks.push(taskData);
      this.notificationManager.showLocal(
        "Tarefa adicionada com sucesso!",
        "success"
      );
    }

    this.saveAndRender();
    this.hideTaskForm();
  }

  editTask(taskId) {
    const task = this.tasks.find((t) => t.id === taskId);
    if (task) {
      this.showTaskForm(task);
    }
  }

  async confirmDeleteTask(taskId) {
    const task = this.tasks.find((t) => t.id === taskId);
    if (!task) return;

    const result = await this.dialogManager.confirm(
      `Tem certeza que deseja excluir a tarefa "${task.title}"?`
    );

    if (result === "confirm") {
      this.tasks = this.tasks.filter((t) => t.id !== taskId);
      this.saveAndRender();
      this.notificationManager.showLocal("Tarefa removida.", "info");
    }
  }

  toggleTaskCompletion(taskId) {
    const task = this.tasks.find((t) => t.id === taskId);
    if (task) {
      task.completed = !task.completed;
      this.saveAndRender();
    }
  }

  saveAndRender() {
    this.saveTasks();
    this.renderTasks();
    this.scheduleNextNotification();
    this.broadcastChannel.postMessage({ type: "update" });
  }

  renderTasks() {
    let processedTasks = this.tasks.filter(
      (task) =>
        task.title.toLowerCase().includes(this.searchTerm) ||
        (task.description &&
          task.description.toLowerCase().includes(this.searchTerm))
    );

    processedTasks.sort((a, b) => {
      if (a.completed !== b.completed) {
        return a.completed ? 1 : -1;
      }

      switch (this.sortOrder) {
        case "date-asc":
          return (
            new Date(`${a.date}T${a.time}`) - new Date(`${b.date}T${b.time}`)
          );
        case "date-desc":
          return (
            new Date(`${b.date}T${b.time}`) - new Date(`${a.date}T${a.time}`)
          );
        case "title-asc":
          return a.title.localeCompare(b.title);
        case "title-desc":
          return b.title.localeCompare(a.title);
        default:
          return 0;
      }
    });

    if (processedTasks.length === 0) {
      this.tasksListElement.innerHTML = `<p class="no-tasks">${
        this.searchTerm
          ? "Nenhuma tarefa encontrada."
          : "Nenhuma tarefa cadastrada. Adicione uma!"
      }</p>`;
      return;
    }

    this.tasksListElement.innerHTML = processedTasks
      .map((task) => this.createTaskElement(task))
      .join("");
  }

  createTaskElement(task) {
    const now = new Date();
    const dueDate = new Date(`${task.date}T${task.time}`);
    const isOverdue = !task.completed && dueDate < now;
    const isDueSoon =
      !task.completed &&
      !isOverdue &&
      dueDate - now > 0 &&
      dueDate - now < 30 * 60 * 1000;

    let statusClass = "";
    let statusText = "";
    if (isOverdue) {
      statusClass = "overdue";
      statusText = "Atrasada";
    } else if (isDueSoon) {
      statusClass = "due-soon";
      statusText = "Em breve";
    }

    const formattedDate = dueDate.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
    });

    return `
      <div class="task-item ${
        task.completed ? "completed" : ""
      } ${statusClass}" data-id="${task.id}">
        <div class="task-header">
          <span class="task-title">${task.title}</span>
          <div class="task-actions">
            <button class="task-button" data-action="edit-task" aria-label="Editar Tarefa">
              <span class="material-symbols-outlined">edit</span>
            </button>
            <button class="task-button" data-action="delete-task" aria-label="Deletar Tarefa">
              <span class="material-symbols-outlined">delete</span>
            </button>
          </div>
        </div>
        ${
          task.description
            ? `<p class="task-description">${task.description}</p>`
            : ""
        }
        <div class="task-footer">
            <div class="task-datetime">
                <span>${formattedDate} • ${task.time}</span>
                ${
                  statusText
                    ? `<span class="due-status ${statusClass}">${statusText}</span>`
                    : ""
                }
            </div>
            <button class="task-button" data-action="toggle-complete" aria-label="Marcar como concluída">
              <span class="material-symbols-outlined">${
                task.completed ? "check_circle" : "radio_button_unchecked"
              }</span>
            </button>
        </div>
      </div>
    `;
  }

  loadTasks() {
    try {
      const savedTasks = localStorage.getItem("tasks");
      return savedTasks ? JSON.parse(savedTasks) : [];
    } catch (error) {
      console.error("Erro ao carregar tarefas:", error);
      return [];
    }
  }

  saveTasks() {
    localStorage.setItem("tasks", JSON.stringify(this.tasks));
  }

  scheduleNextNotification() {
    clearTimeout(this.notificationTimeout);

    const now = new Date();

    const upcomingTasks = this.tasks
      .filter((task) => !task.completed && !task.notified)
      .map((task) => ({
        ...task,
        dateTime: new Date(`${task.date}T${task.time}`),
      }))
      .filter((task) => task.dateTime > now)
      .sort((a, b) => a.dateTime - b.dateTime);

    if (upcomingTasks.length === 0) return;

    const nextTask = upcomingTasks[0];
    const delay = nextTask.dateTime.getTime() - now.getTime();

    if (delay < 0 || delay > 2147483647) return;

    this.notificationTimeout = setTimeout(() => {
      const taskToNotify = this.tasks.find((t) => t.id === nextTask.id);
      if (taskToNotify && !taskToNotify.completed && !taskToNotify.notified) {
        this.notificationManager.showSystem(`Lembrete: ${taskToNotify.title}`, {
          body: `Sua tarefa está agendada para agora (${taskToNotify.time}).`,
          tag: taskToNotify.id,
        });

        taskToNotify.notified = true;
        this.saveAndRender();
      } else {
        this.scheduleNextNotification();
      }
    }, delay);
  }
}
