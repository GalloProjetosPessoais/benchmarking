// Exibir loading
function toggleLoading() {
  let loader = document.querySelector(".loader");
  let overlay = document.querySelector(".overlay");

  let isHidden = loader.style.display === "none";
  console.log(loader);

  loader.style.display = isHidden ? "block" : "none";
  overlay.style.display = isHidden ? "block" : "none";
}

function showLoading() {
  document.querySelector(".overlay").style.display = "block";
  document.querySelector(".loader").style.display = "block";
}

function hideLoading() {
  document.querySelector(".overlay").style.display = "none";
  document.querySelector(".loader").style.display = "none";
}