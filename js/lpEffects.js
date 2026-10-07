// Navbar com fundo ao rolar
const lpNav = document.getElementById("lp-nav");
function updateNav() {
  lpNav.classList.toggle("is-scrolled", window.scrollY > 8);
}
updateNav();
window.addEventListener("scroll", updateNav, { passive: true });

// Revela seções ao entrarem na tela
const revealEls = document.querySelectorAll(".reveal");
if ("IntersectionObserver" in window && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  document.documentElement.classList.add("has-reveal");
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  }, { rootMargin: "0px 0px -8% 0px" });
  revealEls.forEach((el) => observer.observe(el));
}
