const topBtn = document.getElementById("topBtn");

window.addEventListener("scroll", () => {
  if (window.scrollY > 300) {
    topBtn.classList.add("show");
  } else {
    topBtn.classList.remove("show");
  }
});

topBtn.addEventListener("click", () => {
  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
});

const menuToggle = document.getElementById("menuToggle");
const mainNav = document.getElementById("mainNav");

menuToggle.addEventListener("click", () => {
  mainNav.classList.toggle("open");

  if (mainNav.classList.contains("open")) {
    menuToggle.textContent = "✕";
    menuToggle.setAttribute("aria-label", "Lukk meny");
  } else {
    menuToggle.textContent = "☰";
    menuToggle.setAttribute("aria-label", "Åpne meny");
  }
});

const navLinks = mainNav.querySelectorAll("a");

navLinks.forEach(link => {
  link.addEventListener("click", () => {
    mainNav.classList.remove("open");
    menuToggle.textContent = "☰";
    menuToggle.setAttribute("aria-label", "Åpne meny");
  });
});