document.addEventListener("DOMContentLoaded", () => {
  // Alterna o menu de idioma ao clicar no botão correspondente
  document.querySelectorAll('.lang-button').forEach((btn) => {
    btn.addEventListener('click', function(e) {
      e.stopPropagation();
      const menu = this.parentElement.querySelector('.lang-menu');
      if (menu) menu.classList.toggle('hidden');
    });
  });

  // Fecha todos os menus de idioma visíveis ao clicar fora
  document.addEventListener('click', () => {
    document.querySelectorAll('.lang-menu:not(.hidden)').forEach((menu) => {
      menu.classList.add('hidden');
    });
  });
});