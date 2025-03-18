// Exibir loading
function toggleLoading() {
  let loader = document.querySelector(".loader");
  let overlay = document.querySelector(".overlay");

  let isHidden = loader.style.display === "none";

  loader.style.display = isHidden ? "block" : "none";
  overlay.style.display = isHidden ? "block" : "none";
}

document.querySelector("form").addEventListener("submit", function () {
  toggleLoading();
});

document.addEventListener("DOMContentLoaded", () => {
  toggleLoading();
});
