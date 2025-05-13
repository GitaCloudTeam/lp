document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("contact-form");
    const status = document.getElementById("form-status");
    debugger;

    form.addEventListener("submit", async (e) => {
        debugger;
        e.preventDefault();

        const nome = document.getElementById("nome").value.trim();
        const email = document.getElementById("email").value.trim();
        const mensagem = document.getElementById("mensagem").value.trim();

        const token = "7D23IQ NlYc8CLWW65abZMC fPqeIbk5l5Jc9OJey5/Cn5AG3jbVz7Q7iEFb2p 6TyzBHNxrE5cEfsILRbO6WY8tHq5/NO8QK Y37WP7yeVGW1LT3Tr3MXLI7SB6y3aC";

        const payload = {
            email: token,
            form: {
                title: "Formulário de Contato - Site Gita",
                data: [
                    ["Name", nome],
                    ["Email", email],
                    ["Message", mensagem]
                ]
            }
        };

        try {
            const response = await fetch("https://formoid.net/api/push", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                form.reset();
                status.innerText = "Mensagem enviada com sucesso!";
                status.style.color = "green";
            } else {
                throw new Error("Erro ao enviar");
            }
        } catch (error) {
            status.innerText = "Erro ao enviar a mensagem. Tente novamente.";
            status.style.color = "red";
            console.error(error);
        }
    });
});
