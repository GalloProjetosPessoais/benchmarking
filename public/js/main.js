const themeCookieName = "theme";
const themeDark = "dark";
const themeLight = "light";

const sidebarCookieName = "sidebar";

const body = document.body;

function setCookie(cname, cvalue, exdays) {
  var d = new Date();
  d.setTime(d.getTime() + exdays * 24 * 60 * 60 * 1000);
  var expires = "expires=" + d.toUTCString();
  document.cookie = `${cname}=${cvalue}; ${expires}; path=/`;
}

function getCookie(cname) {
  var name = cname + "=";
  var ca = document.cookie.split(";");
  for (var i = 0; i < ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) == " ") {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}

loadTheme();
loadSidebar();

function loadTheme() {
  var theme = getCookie(themeCookieName);
  document.documentElement.classList.add(theme === "" ? themeLight : theme);
}

function switchTheme() {
  if (document.documentElement.classList.contains(themeLight)) {
    document.documentElement.classList.remove(themeLight);
    document.documentElement.classList.add(themeDark);
    setCookie(themeCookieName, themeDark, 30);
  } else {
    document.documentElement.classList.remove(themeDark);
    document.documentElement.classList.add(themeLight);
    setCookie(themeCookieName, themeLight, 30);
  }
}

function loadSidebar() {
  var sidebar = getCookie(sidebarCookieName);
  if (window.innerWidth >= 768 && sidebar !== "") {
    document.documentElement.classList.add("sidebar-expand");
  }
  styleSidebar();
}

function collapseSidebar() {
  document.documentElement.classList.toggle("sidebar-expand");
  if (document.documentElement.classList.contains("sidebar-expand")) {
    setCookie(sidebarCookieName, "sidebar-expand", 30);
  } else {
    setCookie(sidebarCookieName, "", 30);
  }
  styleSidebar();
}

function styleSidebar() {
  let icon = document.querySelector("#sbIcon");
  if (document.documentElement.classList.contains("sidebar-expand")) {
    icon.classList.add("bx-menu");
    icon.classList.remove("bx-menu-alt-left");
    document.querySelector(".sidebar-bottom").style.display = "flex";
  } else {
    icon.classList.remove("bx-menu");
    icon.classList.add("bx-menu-alt-left");
    document.querySelector(".sidebar-bottom").style.display = "none";
  }
}

window.onclick = function (event) {
  openCloseDropdown(event);
};

function closeAllDropdown() {
  var dropdowns = document.getElementsByClassName("dropdown-expand");
  for (var i = 0; i < dropdowns.length; i++) {
    dropdowns[i].classList.remove("dropdown-expand");
  }
}

function openCloseDropdown(event) {
  if (!event.target.closest(".dropdown-toggle")) {
    //
    // Close dropdown when click out of dropdown menu
    //
    closeAllDropdown();
  } else {
    // Obtém o elemento principal com a classe 'dropdown-toggle'
    var toggleElement = event.target.closest(".dropdown-toggle");
    var toggle = toggleElement.dataset.toggle;
    var content = document.getElementById(toggle);

    if (content.classList.contains("dropdown-expand")) {
      closeAllDropdown();
    } else {
      closeAllDropdown();
      content.classList.add("dropdown-expand");
    }
  }
}

function toggleSubItems(sub) {
  const subItens = document.getElementById(sub);
  if (subItens.style.display === "none") {
    subItens.style.display = "block";
  } else {
    subItens.style.display = "none";
  }
}

// Seleciona todos os checkboxes da página
const checkboxes = document.querySelectorAll('input[type="checkbox"]');
if (checkboxes != null) {
  // Itera sobre cada checkbox encontrado
  checkboxes.forEach(function (checkbox) {
    // Adiciona um listener para o evento 'change'
    checkbox.addEventListener("change", function () {
      // Atualiza o value do checkbox baseado no estado
      checkbox.value = checkbox.checked ? "true" : "false";
    });
  });
}
