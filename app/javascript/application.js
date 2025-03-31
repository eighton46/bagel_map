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
