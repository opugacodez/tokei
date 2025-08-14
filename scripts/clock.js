class DigitalClock {
  constructor() {
    this.clockElement = document.getElementById("digital-clock");
    this.dateElement = document.getElementById("date-display");
    this.toggleButton = document.getElementById("toggle-format");
    this.is24HourFormat = true;

    // Exibir o relógio imediatamente ao carregar
    this.updateClock();

    this.init();
  }

  init() {
    // Atualizar a cada segundo
    setInterval(() => this.updateClock(), 1000);

    this.toggleButton.addEventListener("click", () => {
      this.is24HourFormat = !this.is24HourFormat;
      localStorage.setItem("clockFormat", this.is24HourFormat ? "24" : "12");
      this.updateClock();
    });

    // Carregar preferência do formato
    const savedFormat = localStorage.getItem("clockFormat");
    if (savedFormat) {
      this.is24HourFormat = savedFormat === "24";
    }
  }

  updateClock() {
    const now = new Date();

    // Formatar horas
    let hours = now.getHours();
    let ampm = "";

    if (!this.is24HourFormat) {
      ampm = hours >= 12 ? " PM" : " AM";
      hours = hours % 12;
      hours = hours ? hours : 12; // Converter 0 para 12
    }

    const minutes = now.getMinutes().toString().padStart(2, "0");
    const seconds = now.getSeconds().toString().padStart(2, "0");

    const timeString = this.is24HourFormat
      ? `${hours}:${minutes}:${seconds}`
      : `${hours}:${minutes}:${seconds}${ampm}`;

    this.clockElement.textContent = timeString;

    // Formatar data
    const options = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    const dateString = now.toLocaleDateString(undefined, options);
    this.dateElement.textContent = dateString;
  }
}

// Inicializar imediatamente (não esperar DOMContentLoaded)
document.addEventListener("DOMContentLoaded", () => {
  window.digitalClock = new DigitalClock();
});
