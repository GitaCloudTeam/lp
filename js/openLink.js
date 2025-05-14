function openPolicy() {
    const savedLang = localStorage.getItem("lang") || "pt";
    
    let url;
    switch (savedLang) {
        case "en":
            url = "/policy-en.html";
            break;
        default:
            url = "/policy-pt.html";
            break;
    }

    window.open(url, "_blank");
}
