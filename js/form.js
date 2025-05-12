document.getElementById('contact-form').addEventListener('submit', function (e) {
  e.preventDefault();

  const nome = document.getElementById('nome').value;
  const email = document.getElementById('email').value;
  const assunto = document.getElementById('assunto').value;
  const mensagem = document.getElementById('mensagem').value;

  const status = document.getElementById('form-status');
  status.textContent = "Enviando...";

  // Trocar pelo seu endpoint real ou serviço de envio
  fetch('https://example.com/api/send-email', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      nome,
      email,
      assunto,
      mensagem
    })
  })
  .then(response => {
    if (response.ok) {
      status.textContent = "Mensagem enviada com sucesso!";
      document.getElementById('contact-form').reset();
    } else {
      throw new Error("Erro no envio");
    }
  })
  .catch(error => {
    status.textContent = "Ocorreu um erro. Por favor, tente novamente mais tarde.";
    console.error(error);
  });
});