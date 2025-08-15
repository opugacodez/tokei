class DigitalClock {
  constructor() {
    this.clockElement = document.getElementById("digital-clock");
    this.dateElement = document.getElementById("date-display");
    this.toggleButton = document.getElementById("toggle-format");

    this.is24HourFormat = localStorage.getItem("clockFormat") !== "12";

    this.init();
  }

  init() {
    this.updateClock();
    setInterval(() => this.updateClock(), 1000);

    this.toggleButton.addEventListener("click", () => this.toggleFormat());
  }

  toggleFormat() {
    this.is24HourFormat = !this.is24HourFormat;
    localStorage.setItem("clockFormat", this.is24HourFormat ? "24" : "12");
    this.updateClock();
  }

  updateClock() {
    const now = new Date();
    let hours = now.getHours();
    let ampm = "";

    if (!this.is24HourFormat) {
      ampm = hours >= 12 ? " PM" : " AM";
      hours = hours % 12 || 12;
    }

    const formattedHours = hours.toString().padStart(2, "0");
    const minutes = now.getMinutes().toString().padStart(2, "0");
    const seconds = now.getSeconds().toString().padStart(2, "0");

    const timeString = this.is24HourFormat
      ? `${formattedHours}:${minutes}:${seconds}`
      : `${hours}:${minutes}:${seconds}${ampm}`;

    this.clockElement.textContent = timeString;

    const dateOptions = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    this.dateElement.textContent = now.toLocaleDateString("pt-BR", dateOptions);
  }
}
