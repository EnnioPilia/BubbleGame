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

    const game = window.gameInstance;
    window.selectedIndex = 0;

    if (window.currentGameState === "gameover") {
        window.keyboardContext = "gameover";
    } else if (game?.isPaused) {
        window.keyboardContext = "pause";
    } else if (window.currentGameState === "menu") {
        window.keyboardContext = "menu";
    } else {
        window.keyboardContext = "game";
    }

    setTimeout(() => {
        const contexts = {
            menu: ["startButton", "difficultyButton", "menuRankingButton", "settingsButtonMenu"],
            pause: ["resumeButton", "restartButton", "menuButton", "settingsButtonPause", "rankingButton"]
        };

        const ids = contexts[window.keyboardContext];
        if (!ids) return;

        const firstBtn = document.getElementById(ids[0]);
        if (firstBtn) firstBtn.focus();
    }, 0);
}

export function openPopup(id) {
    closeAllPopups();

    window.selectedIndex = 0;
    const el = document.getElementById(id);
    if (!el) return;

    if (id === "settingsPopup") window.keyboardContext = "settings";
    if (id === "audioPopup") window.keyboardContext = "audio";
    if (id === "cursorPopup") window.keyboardContext = "cursor";
    if (id === "backgroundPopup") window.keyboardContext = "background";
    if (id === "rankingPopup") window.keyboardContext = "ranking";

    if (id === "rankingPopup") {
        el.style.display = "flex";
    } else {
        el.classList.add("active");
    }

    setTimeout(() => {
        const contexts = {
            settings: ["openSound", "openCursor", "openBackground", "closeSettings"],
            audio: ["soundToggle", "closeSettingsAudio"],
            cursor: ["validateCursor"],
            background: ["closeBackground"],
            ranking: ["tabEasy", "tabHard", "tabExpert", "closeRanking"]
        };

        const ids = contexts[window.keyboardContext];
        if (!ids) return;

        window.selectedIndex = 0;

        const firstBtn = document.getElementById(ids[0]);
        if (firstBtn) firstBtn.focus();
    }, 0);
}

export function goToPopup(fromId, toId) {
    const from = document.getElementById(fromId);
    const to = document.getElementById(toId);

    if (from) from.classList.remove("active");

    if (to) {
        to.classList.add("active");

        window.selectedIndex = 0;

        if (toId === "settingsPopup") window.keyboardContext = "settings";
        if (toId === "audioPopup") window.keyboardContext = "audio";
        if (toId === "cursorPopup") window.keyboardContext = "cursor";
        if (toId === "backgroundPopup") window.keyboardContext = "background";
    }
}