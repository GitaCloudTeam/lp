// window.addEventListener("DOMContentLoaded", () => {
//     const params = new URLSearchParams(window.location.search);
//     const message = params.get("message");

//     if (message) {
//       const statusEl = document.getElementById("form-status");
//       if (statusEl) {
//         statusEl.textContent = decodeURIComponent(message);
//         statusEl.classList.remove("hidden");
//       }

//       // Remove o parâmetro da URL sem recarregar
//       const url = new URL(window.location.href);
//       url.searchParams.delete("message");
//       window.history.replaceState({}, document.title, url.pathname + url.hash);
//     }
//   });

window.onload = function() {
    document.getElementById('contact-form').addEventListener('submit', function(event) {
        event.preventDefault(); // Impede o envio padrão do formulário

        const form = this;
        const statusDiv = document.getElementById('form-status');

        // Seleciona todos os elementos com a classe 'gita-form-input'
        // const formElements = form.querySelectorAll('.gita-form-input');

        const serviceID = 'service_neco2c9';
        const templateID = 'template_6io88nl';

        // Desabilita os elementos selecionados
        // formElements.forEach(el => el.disabled = true);

        // Mostra "enviando..."
        statusDiv.innerHTML = 'Enviando...';
        statusDiv.className = 'block rounded bg-blue-800 border-blue-600 text-blue-100 font-inter text-lg p-4 w-fit mt-6'; // Classe de "loading"
        statusDiv.style.display = 'block';

        emailjs.sendForm(serviceID, templateID, form)
            .then(() => {
                // Sucesso
                statusDiv.innerHTML = 'Mensagem enviada com sucesso!';
                statusDiv.className = 'block rounded bg-green-800 border-green-600 text-green-100 font-inter text-lg p-4 w-fit mt-6'; // Classe de sucesso
                
                form.reset(); // Limpa o form
                grecaptcha.reset(); // Limpa reCAPTCHA
            }, (err) => {
                // Erro
                console.error('EmailJS Error:', err);
                statusDiv.innerHTML = 'Ocorreu um erro. (Erro: ' + JSON.stringify(err) + ')';
                statusDiv.className = 'block rounded bg-red-800 border-red-600 text-red-100 font-inter text-lg p-4 w-fit mt-6'; // Classe de erro
                
                grecaptcha.reset(); // Limpa reCAPTCHA
            })
            .finally(() => {
                // Reabilita todos os elementos
                // formElements.forEach(el => el.disabled = false);
            });
    });
}