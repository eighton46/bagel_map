// Entry point for the build script in your package.json
import "@hotwired/turbo-rails"
import "./controllers"
import * as bootstrap from "bootstrap"

document.addEventListener("DOMContentLoaded", function () {
  document.querySelectorAll("input[type='number']").forEach((input) => {
    input.addEventListener("input", function () {
      if (this.value < 0) this.value = 0; // 0 未満の値を入力できないようにする
    });
  });
});

document.addEventListener("DOMContentLoaded", function () {
  const resetButton = document.getElementById("reset-button");

  if (resetButton) {
    resetButton.addEventListener("click", function () {
      document.getElementById("rating_form").value = "";
      document.getElementById("user_ratings_total_form").value = "";
    });
  }
});
