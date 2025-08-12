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

      // Atualiza a URL com o parâmetro correto
      const url = new URL(window.location.href);
      if (lang === "en") {
        url.search = "?en";
      } else {
        url.search = "";
      }
      history.replaceState(null, "", url.toString());
    } catch (error) {
      console.error("Erro ao carregar idioma:", error);
    }
  }

  // Carrega o idioma salvo ou pt
  const savedLang = localStorage.getItem("lang") || "pt";

document.addEventListener("DOMContentLoaded", async function () {
  const params = new URLSearchParams(window.location.search);
  let initialLang = "pt";

  if (params.get("lang") === "en" || params.has("en")) {
    initialLang = "en";
  } else {
    const savedLang = localStorage.getItem("lang");
    if (savedLang) {
      initialLang = savedLang;
    }
  }

  setLanguage(initialLang, true);
});