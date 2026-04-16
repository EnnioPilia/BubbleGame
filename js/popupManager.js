const POPUPS = [
    "settingsPopup",
    "audioPopup",
    "cursorPopup",
    "backgroundPopup",
    "rankingPopup"
];

export function closeAllPopups() {
    POPUPS.forEach(id => {
        const el = document.getElementById(id);
        if (!el) return;

        el.classList.remove("active");

        if (id === "rankingPopup") {
            el.style.display = "none";
        }
    });
}

export function openPopup(id) {
    closeAllPopups();

    const el = document.getElementById(id);
    if (!el) return;

    if (id === "rankingPopup") {
        el.style.display = "flex";

        el.onclick = (e) => {
            if (e.target === el) {
                e.stopPropagation(); 
            }
        };

    } else {
        el.classList.add("active");
    }
}
export function goToPopup(fromId, toId) {
    const from = document.getElementById(fromId);
    const to = document.getElementById(toId);

    if (from) {
        from.classList.remove("active");
    }

    if (to) {
        to.classList.add("active");
    }
}