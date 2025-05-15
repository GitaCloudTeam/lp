document.getElementById("menu-toggle").addEventListener("click", () => {
  toggleMenu();
});

function toggleMenu() {
  const mobileMenu = document.getElementById("mobile-menu");
  mobileMenu.classList.toggle("hidden");
}