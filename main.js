import { initSound, applyVolume, sounds } from "./js/sound.js";
import { initAudioUI } from "./js/audioUI.js";
import { initCursor } from "./js/cursor.js";
import { initSettingsUI } from "./js/settings.js";
import { initUI } from "./js/UI.js";
import { initBackgroundPopup } from "./js/backgroundPopup.js";
import { initDifficultyButton } from "./js/UI.js";
import { getState } from "./js/sound.js";
import Game from "./js/game.js";

initSound();
initCursor();
initUI();
initSettingsUI();
initAudioUI();
initBackgroundPopup();

const game = new Game();

window.gameInstance = game;
window.aimCursor
window.aimStep = 0;
window.currentTarget = null;
window.keyboardContext = "menu";

let aimX = window.innerWidth / 2;
let aimY = window.innerHeight / 2;
let currentX = window.innerWidth / 2;
let currentY = window.innerHeight / 2;
let isTracking = false;

document.addEventListener("click", (e) => {
    if (e.target.id === "startButton") return;

    if (!sounds.musicMenu) return;

    const { soundEnabled } = getState();

    if (soundEnabled && sounds.musicMenu.paused) {
        sounds.musicMenu.play();
        applyVolume();
    }

}, { once: true });

document.addEventListener("dblclick", e => e.preventDefault());

const difficultyButton = document.getElementById("difficultyButton");
const difficultyText = document.getElementById("difficultyText");

const modes = ["easy", "hard", "expert"];
let currentModeIndex = 0;

difficultyButton.addEventListener("click", () => {
    currentModeIndex = (currentModeIndex + 1) % modes.length;

    const mode = modes[currentModeIndex];
    game.difficulty = mode;

    difficultyText.textContent = mode.toUpperCase();
    difficultyText.classList.remove("easy", "hard", "expert");
    difficultyText.classList.add(mode);
});

function getNextTarget() {
    const bubbles = document.querySelectorAll(".bubble");

    return [...bubbles].find(b => {
        const instance = b.instance;

        return instance &&
            !instance.isBad &&
            !instance.isHeart &&
            !instance.isSlow &&
            !instance.isStar &&
            !instance.isAim &&
            !instance.isSpecial;
    }) || null;
}


document.addEventListener("click", (e) => {
    const game = window.gameInstance;
    if (!game || !game.isAimActive || game.isPaused) return;

    e.preventDefault();
    e.stopPropagation();

    if (!isTracking) {
        window.currentTarget = getNextTarget();

        if (window.currentTarget) {

            currentX = window.innerWidth / 2;
            currentY = window.innerHeight / 2;

            const cursor = document.getElementById("customCursor");
            cursor.style.left = currentX + "px";
            cursor.style.top = currentY + "px";

            isTracking = true;
            followTarget();
        }
    }
    else {
        if (window.currentTarget) {
            window.currentTarget.click();
        }

        resetCursor();
    }
});



function followTarget() {
    if (!isTracking || !window.gameInstance.isAimActive) return;
    if (window.gameInstance.isPaused) return;

    const cursor = document.getElementById("customCursor");

    if (!window.currentTarget || !document.body.contains(window.currentTarget)) {
        resetCursor();
        return;
    }

    const rect = window.currentTarget.getBoundingClientRect();

    const targetX = rect.left + rect.width / 2;
    const targetY = rect.top + rect.height / 2;

    const dx = targetX - currentX;
    const dy = targetY - currentY;

    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < 1) {
        currentX = targetX;
        currentY = targetY;
    } else {
        const smoothing = 0.15;
        currentX += dx * smoothing;
        currentY += dy * smoothing;
    }

    cursor.style.left = currentX + "px";
    cursor.style.top = currentY + "px";

    if (window.aimCursor) {
        const aimDx = currentX - aimX;
        const aimDy = currentY - aimY;

        const aimSmoothing = 0.15;

        aimX += aimDx * aimSmoothing;
        aimY += aimDy * aimSmoothing;

        const offsetY = -13;

        window.aimCursor.style.left = aimX + "px";
        window.aimCursor.style.top = (aimY + offsetY) + "px";
    }

    requestAnimationFrame(followTarget);
}

function resetCursor() {
    const cursor = document.getElementById("customCursor");

    isTracking = false;

    currentX = window.innerWidth / 2;
    currentY = window.innerHeight / 2;

    cursor.style.left = currentX + "px";
    cursor.style.top = currentY + "px";

    window.currentTarget = null;

    if (aimCursor) {
        aimX = currentX;
        aimY = currentY;

        aimCursor.style.left = aimX + "px";
        aimCursor.style.top = aimY + "px";
    }
}

function stopAimTracking() {
    isTracking = false;
    window.currentTarget = null;
}

document.addEventListener("keydown", (e) => {
    const game = window.gameInstance;
    if (!game) return;

    if (e.key === "Escape") {

        const anyPopupOpen = document.querySelector(
            "#settingsPopup.active, #audioPopup.active, #cursorPopup.active, #backgroundPopup.active"
        ) || document.getElementById("rankingPopup")?.style.display === "flex";

        if (anyPopupOpen) {
            closeAllPopups();
            return;
        }

        if (window.currentGameState === "menu") return;

        if (!game.isPaused) {
            stopAimTracking();
            resetCursor();
            game.pauseGame();
        } else {
            game.resumeGame();
        }
    }
});



const menuButtons = [
    document.getElementById("startButton"),
    document.getElementById("difficultyButton"),
    document.getElementById("menuRankingButton"),
    document.getElementById("settingsButtonMenu")
];

let selectedIndex = 0;

function updateFocus() {
    menuButtons[selectedIndex].focus();
}

document.addEventListener("keydown", (e) => {

    if ((e.key === " " || e.code === "Space") && document.activeElement.tagName !== "INPUT") {
        e.preventDefault();
        e.stopPropagation();
        return;
    }
    const contexts = {
        menu: ["startButton", "difficultyButton", "menuRankingButton", "settingsButtonMenu", "playerName"],
        pause: ["resumeButton", "restartButton", "menuButton", "settingsButtonPause", "rankingButton"],
        gameover: ["restartButtonGameOver", "menuButtonGameOver", "rankingButtonGameOver"],
        settings: ["openSound", "openCursor", "openBackground", "closeSettings"],
        audio: ["soundToggle", "closeAudio"],
        cursor: ["validateCursor"],
        background: ["closeBackground"],
        ranking: ["tabEasy", "tabHard", "tabExpert", "closeRanking"]
    };

    const active = document.activeElement;

    const isTyping =
        active &&
        (active.tagName === "INPUT" ||
            active.tagName === "TEXTAREA" ||
            active.isContentEditable);

    if (isTyping) {

        if (e.key === "Escape") {
            document.activeElement.blur();

            const ids = contexts[window.keyboardContext];
            if (ids) {
                window.selectedIndex = 0;
                const el = document.getElementById(ids[0]);
                if (el) el.focus();
            }
        }

        return;
    }
    
    if (e.key === " " || e.code === "Space") {
        e.preventDefault();
        e.stopPropagation();
        return;
    }

    const ids = contexts[window.keyboardContext];
    if (!ids) return;

    const buttons = ids.map(id => document.getElementById(id)).filter(Boolean);

    if (buttons.length === 0) return;

    if (typeof window.selectedIndex === "undefined") {
        window.selectedIndex = 0;
    }

    if (e.key === "ArrowDown") {
        window.selectedIndex = (window.selectedIndex + 1) % buttons.length;
        const el = buttons[window.selectedIndex];

        el.focus();

        if (el.tagName === "INPUT") {
            el.select();
        }
    }

    if (e.key === "ArrowUp") {
        window.selectedIndex = (window.selectedIndex - 1 + buttons.length) % buttons.length;
        const el = buttons[window.selectedIndex];

        el.focus();

        if (el.tagName === "INPUT") {
            el.select();
        }
    }

    if (e.key === "Enter") {
        if (window.keyboardContext === "pause") {
        }
        buttons[window.selectedIndex].click();
    }

});