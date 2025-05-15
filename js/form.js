window.addEventListener("DOMContentLoaded", () => {
    const params = new URLSearchParams(window.location.search);
    const message = params.get("message");

    if (message) {
      const statusEl = document.getElementById("form-status");
      if (statusEl) {
        statusEl.textContent = decodeURIComponent(message);
        statusEl.classList.remove("hidden");
      }

      // Remove o parâmetro da URL sem recarregar
      const url = new URL(window.location.href);
      url.searchParams.delete("message");
      window.history.replaceState({}, document.title, url.pathname + url.hash);
    }
  });