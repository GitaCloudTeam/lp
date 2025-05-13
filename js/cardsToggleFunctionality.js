const cardContainer = document.getElementById('card-container');
const imageWrapper = document.getElementById('image-wrapper');
const mainImage = document.getElementById('main-image');
const descriptionTextElement = document.getElementById('description-text');
const titleElement = document.querySelector('#text-container h2');


const cards = cardContainer.querySelectorAll('.card');

cards.forEach(card => {
    card.addEventListener('click', async () => {
        try {
        const lang = localStorage.getItem("lang") || "pt";
        const response = await fetch(`./lang/${lang}.json`);
        const translations = await response.json();

        const image = card.getAttribute('data-image');
        const title = card.getAttribute('data-title');
        const description = card.getAttribute('data-description');

        mainImage.src = image;
        descriptionTextElement.textContent = translations[description];

        cards.forEach(c => c.classList.remove('active'));
        card.classList.add('active');
        } catch (e) {
            console.error("Erro ao carregar idioma:", error);
        }
    });
});

// Initialize the first card as active
if (cards.length > 0) {
    cards[0].click();
}