class NotificationManager {
  constructor() {
    this.notificationContainer = document.getElementById(
      "notification-container"
    );
    this.notificationTimeout = null;
    this.permission = Notification.permission;
  }

  async requestSystemPermission() {
    if (!("Notification" in window)) {
      console.warn("Este navegador não suporta notificações.");
      return "denied";
    }

    if (this.permission === "granted") {
      return "granted";
    }

    this.permission = await Notification.requestPermission();

    if (this.permission === "denied") {
      this.showLocal(
        "As notificações estão bloqueadas. Ative nas configurações do navegador.",
        "error",
        10000
      );
    }

    return this.permission;
  }

  showLocal(message, type = "info", duration = 4000) {
    if (!this.notificationContainer) return;

    clearTimeout(this.notificationTimeout);

    this.notificationContainer.textContent = message;
    this.notificationContainer.className = `notification ${type}`;
    this.notificationContainer.classList.remove("hidden");

    this.notificationTimeout = setTimeout(() => {
      this.notificationContainer.classList.add("hidden");
    }, duration);
  }

  async showSystem(title, options) {
    try {
      if (this.permission !== "granted") {
        const currentPermission = await this.requestSystemPermission();
        if (currentPermission !== "granted") {
          console.log("Permissão para notificar negada.");
          return;
        }
      }

      if (!navigator.serviceWorker) {
        this.showLocal(title, "info", 4000);
        return;
      }

      const reg = await navigator.serviceWorker.getRegistration();
      if (reg) {
        const defaultOptions = {
          icon: "assets/icons/icon-192x192.svg",
          badge: "assets/icons/badge-72x72.svg",
          ...options,
        };
        reg.showNotification(title, defaultOptions);
      } else {
        this.showLocal(title, "info", 4000);
      }
    } catch (error) {
      console.error("Erro ao mostrar notificação:", error);
      this.showLocal(title, "info", 4000);
    }
  }
}
