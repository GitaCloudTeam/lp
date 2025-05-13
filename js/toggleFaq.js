function toggleFAQ(id) {
    const element = document.getElementById(id);
    element.classList.toggle('hidden');
    const icon = element.previousElementSibling.querySelector('i');
    icon.classList.toggle('rotate-180');
}