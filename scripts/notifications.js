/**
 * Tokei - notifications.js
 * Gerencia notificações locais (na página) e notificações do sistema (Push API).
 */

class NotificationManager {
  constructor() {
    this.notificationContainer = document.getElementById(
      "notification-container"
    );
    this.notificationTimeout = null;
    this.permission = Notification.permission;
  }

  /**
   * Solicita permissão para exibir notificações do sistema ao usuário.
   * @returns {Promise<string>} O status da permissão ('granted', 'denied', 'default').
   */
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
        10000 // Mostra por mais tempo
      );
    }

    return this.permission;
  }

  /**
   * Exibe uma notificação local (um banner na página).
   * @param {string} message - A mensagem a ser exibida.
   * @param {string} type - O tipo de notificação ('info', 'success', 'error').
   * @param {number} duration - Duração em milissegundos.
   */
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

  /**
   * Exibe uma notificação do sistema operacional.
   * @param {string} title - O título da notificação.
   * @param {object} options - Opções da notificação (body, icon, etc.).
   */
  async showSystem(title, options) {
    // Garante que temos a permissão mais recente antes de tentar notificar
    if (this.permission !== "granted") {
      const currentPermission = await this.requestSystemPermission();
      if (currentPermission !== "granted") {
        console.log("Permissão para notificar negada.");
        return;
      }
    }

    const reg = await navigator.serviceWorker.getRegistration();
    if (reg) {
      const defaultOptions = {
        icon: "/tokei/assets/icons/icon-192x192.svg",
        badge: "/tokei/assets/icons/badge-72x72.svg",
        ...options,
      };
      reg.showNotification(title, defaultOptions);
    }
  }
}
