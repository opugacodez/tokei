/**
 * Tokei - clock.js
 * Gerencia o relógio digital e a exibição da data.
 */

class DigitalClock {
  constructor() {
    this.clockElement = document.getElementById("digital-clock");
    this.dateElement = document.getElementById("date-display");
    this.toggleButton = document.getElementById("toggle-format");

    // Carrega a preferência de formato do localStorage ou usa '24' como padrão.
    this.is24HourFormat = localStorage.getItem("clockFormat") !== "12";

    this.init();
  }

  init() {
    // Atualiza o relógio imediatamente e depois a cada segundo.
    this.updateClock();
    setInterval(() => this.updateClock(), 1000);

    // Adiciona o evento de clique para alternar o formato.
    this.toggleButton.addEventListener("click", () => this.toggleFormat());
  }

  /**
   * Alterna entre o formato 24h e 12h.
   */
  toggleFormat() {
    this.is24HourFormat = !this.is24HourFormat;
    localStorage.setItem("clockFormat", this.is24HourFormat ? "24" : "12");
    this.updateClock(); // Atualiza imediatamente após a troca.
  }

  /**
   * Atualiza a exibição da hora e da data.
   */
  updateClock() {
    const now = new Date();
    let hours = now.getHours();
    let ampm = "";

    if (!this.is24HourFormat) {
      ampm = hours >= 12 ? " PM" : " AM";
      hours = hours % 12 || 12; // Converte 0 para 12 para o formato 12h.
    }

    // Garante que os números tenham sempre dois dígitos.
    const formattedHours = hours.toString().padStart(2, "0");
    const minutes = now.getMinutes().toString().padStart(2, "0");
    const seconds = now.getSeconds().toString().padStart(2, "0");

    const timeString = this.is24HourFormat
      ? `${formattedHours}:${minutes}:${seconds}`
      : `${hours}:${minutes}:${seconds}${ampm}`;

    this.clockElement.textContent = timeString;

    // Formata e exibe a data.
    const dateOptions = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    this.dateElement.textContent = now.toLocaleDateString("pt-BR", dateOptions);
  }
}
