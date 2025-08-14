/**
 * Tokei - main.js
 * Ponto de entrada principal do aplicativo.
 * Orquestra a inicialização de todos os módulos.
 */

document.addEventListener("DOMContentLoaded", () => {
  // Função para registrar o Service Worker
  const registerServiceWorker = () => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          console.log("Service Worker registrado com sucesso:", registration);
        })
        .catch((error) => {
          console.error("Falha ao registrar Service Worker:", error);
        });
    }
  };

  // Inicialização dos Módulos
  const notificationManager = new NotificationManager();
  const dialogManager = new DialogManager();
  const clock = new DigitalClock();
  const taskManager = new TaskManager(notificationManager, dialogManager);
  const exportImportManager = new ExportImportManager(
    taskManager,
    notificationManager,
    dialogManager
  );

  // Event Listener para o botão de doação
  const donateBtn = document.getElementById("donate-btn");
  donateBtn.addEventListener("click", () => {
    dialogManager.showPixDialog();
  });

  // Inicia o Service Worker
  registerServiceWorker();
});
