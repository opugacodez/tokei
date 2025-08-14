class NotificationManager {
  constructor() {
    this.notificationTimeout = null;
    this.init();
  }

  init() {
    this.requestPermission();
  }

  requestPermission() {
    if ("Notification" in window && Notification.permission !== "denied") {
      Notification.requestPermission().then((permission) => {
        console.log("Permissão para notificações:", permission);
      });
    }
  }

  showLocalNotification(message, type = "info") {
    const notification = document.getElementById("notification");
    if (!notification) return;

    notification.textContent = message;
    notification.className = `notification ${type}`;
    notification.classList.remove("hidden");

    clearTimeout(this.notificationTimeout);
    this.notificationTimeout = setTimeout(() => {
      notification.classList.add("hidden");
    }, 5000);
  }

  showSystemNotification(title, body) {
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification(title, { body });
    }
  }
}
