async function setLanguage(lang, isHomePage = false) {
    // Fecha todos os menus de idioma visíveis
    document.querySelectorAll('.lang-menu:not(.hidden)').forEach(menu => {
      menu.classList.add("hidden");
    });

    try {
      const response = await fetch(`./lang/${lang}.json`);
      const translations = await response.json();

      document.querySelectorAll("[data-i18n]").forEach((el) => {
        const key = el.getAttribute("data-i18n");
        if (translations[key]) {
          el.textContent = translations[key];
        }
      });

      // Atualiza o <title> do documento se houver
      if (translations["site.title"]) {
        document.title = translations["site.title"];
      }

      // Atualiza o array de textos para o rotating text
      if (isHomePage && translations["hero.rotating_texts"]) {
        texts = translations["hero.rotating_texts"];
        // Reinicia o typewriter para o novo idioma
        textIndex = 0;
        charIndex = 0;
        dynamicText.textContent = "";
        clearTimeout(typingTimeout); // Limpa qualquer timeout anterior
        typeWriter();
      }

      // Salva a escolha no localStorage
      localStorage.setItem("lang", lang);

      // Seta idioma selecionado em todos os botões de idioma
      document.querySelectorAll('.lang-button-span').forEach(span => {
        span.textContent = lang;
      });
    } catch (error) {
      console.error("Erro ao carregar idioma:", error);
    }
  }

  // Carrega o idioma salvo (ou pt por padrão)
  const savedLang = localStorage.getItem("lang") || "pt";

document.addEventListener("DOMContentLoaded", async function () {
  setLanguage(savedLang, true);
});