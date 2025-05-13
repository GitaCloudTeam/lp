async function setLanguage(lang) {
    const langMenu = document.getElementById("langMenu");
    langMenu.classList.add("hidden");

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
      if (translations["hero.rotating_texts"]) {
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

      // Seta idioma selecionado no botão
      const langButtonTextSpan = document.getElementById('langButtonSpan');
      langButtonTextSpan.textContent = lang;
    } catch (error) {
      console.error("Erro ao carregar idioma:", error);
    }
  }

  // Carrega o idioma salvo (ou pt por padrão)
  const savedLang = localStorage.getItem("lang") || "pt";

  setLanguage(savedLang);