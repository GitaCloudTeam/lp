const langButton = document.getElementById("langButton");
const langMenu = document.getElementById("langMenu");

langButton.addEventListener("click", () => {
    langMenu.classList.toggle("hidden");
});

document.addEventListener("click", (e) => {
    if (!langButton.contains(e.target) && !langMenu.contains(e.target)) {
        langMenu.classList.add("hidden");
    }
});