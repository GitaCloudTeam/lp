function toggleFAQ(id) {
    const element = document.getElementById(id);
    element.classList.toggle('hidden');
    // O lucide troca o <i> por <svg>, então procura os dois
    const icon = element.previousElementSibling.querySelector('svg, i');
    if (icon) icon.classList.toggle(icon.classList.contains('lucide-plus') ? 'rotate-45' : 'rotate-180');
    element.parentElement.classList.toggle('is-open');
}
