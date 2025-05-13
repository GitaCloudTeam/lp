let texts = [
    "os eventos",
    "a saúde",
    "os problemas",
    "os incidentes",
    "as boas práticas",
];

let textIndex = 0;
let charIndex = 0;
let typingTimeout;

const typingSpeed = 75; // milissegundos entre cada caractere
const waitTime = 1500;  // tempo para trocar a frase
const dynamicText = document.getElementById('dynamicText');

function typeWriter() {
    const currentText = texts[textIndex];
    if (charIndex < currentText.length) {
    dynamicText.textContent += currentText.charAt(charIndex);
    charIndex++;
    typingTimeout = setTimeout(typeWriter, typingSpeed);
    } else {
    typingTimeout = setTimeout(() => {
        dynamicText.textContent = "";
        charIndex = 0;
        textIndex = (textIndex + 1) % texts.length;
        typeWriter();
    }, waitTime);
    }
}