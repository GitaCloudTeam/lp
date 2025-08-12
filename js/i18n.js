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

      const currentPath = window.location.pathname;
      let newPath;

      if (lang === 'en') {
          // Adiciona /en se não tiver
          if (!currentPath.endsWith('/en')) {
              // Remove uma barra final evita /en/
              const basePath = currentPath.endsWith('/') ? currentPath.slice(0, -1) : currentPath;
              newPath = basePath + '/en';
          }
      } else {
          // Para 'pt' ou qualquer outro idioma futuramente
          // Remove /en se tiver
          if (currentPath.endsWith('/en')) {
              newPath = currentPath.slice(0, -3);
              // Remove os últimos 3 caracteres ('/en')
              // Se o resultado for uma string vazia, significa que estava na raiz.
              if (newPath === '') {
                  newPath = '/';
              }
          }
      }
      
      // Altera a URL no navegador apenas se houver mudança
      if (newPath && newPath !== currentPath) {
          history.replaceState(null, '', newPath);
      }
    } catch (error) {
      console.error("Erro ao carregar idioma:", error);
    }
  }

  // Carrega o idioma salvo ou pt
  const savedLang = localStorage.getItem("lang") || "pt";

document.addEventListener("DOMContentLoaded", async function () {
  let initialLang = "pt";

  if (window.location.pathname.endsWith('/en')) {
      initialLang = 'en';
  } else {
      // Se a URL não tiver idioma, usa o que está no localStorage
      const savedLang = localStorage.getItem("lang");
      if (savedLang) {
          initialLang = savedLang;
      }
  }

  setLanguage(savedLang, true);
});