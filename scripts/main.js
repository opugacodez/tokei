document.addEventListener("DOMContentLoaded", () => {
  const registerServiceWorker = () => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("sw.js")
        .then((registration) => {
          console.log("Service Worker registrado com sucesso:", registration);
        })
        .catch((error) => {
          console.error("Falha ao registrar Service Worker:", error);
          const notificationManager = new NotificationManager();
          notificationManager.showLocal(
            "Alguns recursos podem não funcionar corretamente (executando localmente)",
            "warning",
            5000
          );
        });
    }
  };

  const notificationManager = new NotificationManager();
  const dialogManager = new DialogManager();
  const clock = new DigitalClock();
  const taskManager = new TaskManager(notificationManager, dialogManager);
  const exportImportManager = new ExportImportManager(
    taskManager,
    notificationManager,
    dialogManager
  );

  const donateBtn = document.getElementById("donate-btn");
  donateBtn.addEventListener("click", () => {
    dialogManager.showPixDialog();
  });

  registerServiceWorker();
});