// Entry point for the build script in your package.json
import "@hotwired/turbo-rails"
import "./controllers"
import * as bootstrap from "bootstrap"

// 絞り込み検索フォームにマイナスの値が入力されたら「０」を返す
document.addEventListener("DOMContentLoaded", function () {
  document.querySelectorAll("input[type='number']").forEach((input) => {
    input.addEventListener("input", function () {
      if (this.value < 0) this.value = 0; // 0 未満の値を入力できないようにする
    });
  });
});

// 絞り込み検索のドロップダウン内のクリアボタンを押すと、フォームがクリアされる
document.addEventListener("DOMContentLoaded", function () {
  const resetButton = document.getElementById("reset-button");

  if (resetButton) {
    resetButton.addEventListener("click", function () {
      document.getElementById("rating_form").value = "";
      document.getElementById("user_ratings_total_form").value = "";
    });
  }
});

// 入力値のあるフォームを選択したときに入力値をハイライトする
document.addEventListener("DOMContentLoaded", function () {
  // フォーム要素を取得
  const inputFields = document.querySelectorAll(".auto-select");

  inputFields.forEach((input) => {
    input.addEventListener("focus", function () {
      this.select(); // フォームの中身を全選択
    });
  });
});
