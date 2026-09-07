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

const contactForm = document.getElementById("contactForm");

contactForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const formData = new FormData(contactForm);

  try {
    const response = await fetch("/api/contact", {
      method: "POST",
      body: formData
    });

    const data = await response.json();

    if (data.success) {
      alert("Takk! Forespørselen er mottatt.");
      contactForm.reset();
    } else {
      alert("Noe gikk galt. Prøv igjen.");
    }
  } catch (error) {
    console.error(error);
    alert("Kunne ikke sende forespørselen.");
  }
});