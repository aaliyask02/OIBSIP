
"use strict";

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("converterForm");
  const temperatureInput = document.getElementById("temperature");
  const unitSelect = document.getElementById("unit");
  const errorMessage = document.getElementById("errorMessage");
  const clearButton = document.getElementById("clearButton");
  const resultNote = document.getElementById("resultNote");

  const resultC = document.getElementById("resultC");
  const resultF = document.getElementById("resultF");
  const resultK = document.getElementById("resultK");

  const ABSOLUTE_ZERO = {
    C: -273.15,
    F: -459.67,
    K: 0
  };

  function showError(message) {
    errorMessage.textContent = message;
    errorMessage.hidden = false;
    temperatureInput.setAttribute("aria-invalid", "true");
  }

  function clearError() {
    errorMessage.textContent = "";
    errorMessage.hidden = true;
    temperatureInput.removeAttribute("aria-invalid");
  }

  function resetResults() {
    resultC.textContent = "—";
    resultF.textContent = "—";
    resultK.textContent = "—";
    resultNote.textContent = "Your converted values will appear here.";
    document.querySelectorAll(".result-card").forEach((card) => {
      card.classList.remove("result-card-active");
    });
  }

  function formatTemperature(value) {
    // Avoid displaying floating-point calculation noise.
    const rounded = Number(value.toFixed(6));
    return Object.is(rounded, -0) ? "0" : rounded.toLocaleString("en-US", {
      maximumFractionDigits: 6,
      useGrouping: false
    });
  }

  function convertToCelsius(value, unit) {
    if (unit === "C") {
      return value;
    }

    if (unit === "F") {
      return (value - 32) * 5 / 9;
    }

    // Kelvin
    return value - 273.15;
  }

  function convertFromCelsius(celsius) {
    return {
      C: celsius,
      F: (celsius * 9 / 5) + 32,
      K: celsius + 273.15
    };
  }

  function validateTemperature(value, unit) {
    if (temperatureInput.value.trim() === "") {
      return "Please enter a temperature value.";
    }

    if (!Number.isFinite(value)) {
      return "Please enter a valid, finite number.";
    }

    if (value < ABSOLUTE_ZERO[unit]) {
      if (unit === "C") {
        return "Temperature cannot be below absolute zero (−273.15°C).";
      }

      if (unit === "F") {
        return "Temperature cannot be below absolute zero (−459.67°F).";
      }

      return "Kelvin cannot be below absolute zero (0 K).";
    }

    return "";
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    clearError();

    const rawValue = temperatureInput.value.trim();
    const unit = unitSelect.value;

    if (rawValue === "") {
      resetResults();
      showError("Please enter a temperature value.");
      temperatureInput.focus();
      return;
    }

    const value = Number(rawValue);

    const validationError = validateTemperature(value, unit);

    if (validationError) {
      resetResults();
      showError(validationError);
      temperatureInput.focus();
      return;
    }

    const celsius = convertToCelsius(value, unit);
    const results = convertFromCelsius(celsius);

    // Protect against numeric overflow from extremely large inputs.
    if (!Object.values(results).every(Number.isFinite)) {
      resetResults();
      showError("This value is too large to convert. Please enter a smaller number.");
      temperatureInput.focus();
      return;
    }

    resultC.textContent = `${formatTemperature(results.C)} °C`;
    resultF.textContent = `${formatTemperature(results.F)} °F`;
    resultK.textContent = `${formatTemperature(results.K)} K`;

    const unitNames = {
      C: "Celsius",
      F: "Fahrenheit",
      K: "Kelvin"
    };

    resultNote.textContent =
      `${formatTemperature(value)} ${unit === "K" ? "K" : `°${unit}`} ` +
      `converted from ${unitNames[unit]}. All three units are shown above.`;

    document.querySelectorAll(".result-card").forEach((card, index) => {
      card.classList.toggle("result-card-active", index === "CFK".indexOf(unit));
    });
  });

  // Remove the error as the user edits the value.
  temperatureInput.addEventListener("input", () => {
    clearError();
  });

  unitSelect.addEventListener("change", () => {
    clearError();
  });

  clearButton.addEventListener("click", () => {
    form.reset();
    clearError();
    resetResults();
    temperatureInput.focus();
  });

  // Start with an empty input and empty results.
  resetResults();
});
