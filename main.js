import { sounds, getState, initSoundSystem, play } from "./js/sound.js";
import { initAudioUI } from "./js/audioUI.js";
import { initCursor } from "./js/cursor.js";
import { initSettingsUI } from "./js/settings.js";
import { initUI } from "./js/UI.js";
import { initBackgroundPopup } from "./js/backgroundPopup.js";
import { initKeyboardFixes } from "./js/popupManager.js";
import { closeAllPopups } from "./js/popupManager.js";
import Game from "./js/game.js";

initSoundSystem();
initCursor();
initUI();
initSettingsUI();
initAudioUI();
initBackgroundPopup();
initKeyboardFixes();

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

document.addEventListener("click", () => {
    const { soundEnabled, musicEnabled } = getState();

    if (window.currentGameState !== "menu") return;

    if (soundEnabled && musicEnabled && sounds.musicMenu) {
        if (sounds.musicMenu.paused) {
            sounds.musicMenu.play().catch(() => { });
        }
    }
});

document.addEventListener("dblclick", e => e.preventDefault());

const difficultyButton = document.getElementById("difficultyButton");
const difficultyText = document.getElementById("difficultyText");
const difficultyLabel = document.getElementById("difficultyLabel");

const defaultMode = "easy";
game.difficulty = defaultMode;

difficultyText.textContent = defaultMode.toUpperCase();
difficultyText.classList.remove("easy", "hard", "expert", "training");
difficultyText.classList.add(defaultMode);

if (defaultMode === "training") {
    difficultyLabel.textContent = "";
} else {
    difficultyLabel.textContent = "MODE - ";
}

const modes = ["training", "easy", "hard", "expert"];
let currentModeIndex = 0;

difficultyButton.addEventListener("click", () => {
    currentModeIndex = (currentModeIndex + 1) % modes.length;

    const mode = modes[currentModeIndex];
    game.difficulty = mode;

    difficultyText.textContent = mode.toUpperCase();

    if (mode === "training") {
        difficultyLabel.textContent = "";
    } else {
        difficultyLabel.textContent = "MODE - ";
    }

    difficultyText.classList.remove("easy", "hard", "expert", "training");
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

    const active = document.activeElement;
    const isAudio = window.keyboardContext === "audio";

    if (active && active.type === "range") {

        if (e.key === "ArrowLeft" || e.key === "ArrowRight") return;

        if (e.key === "ArrowDown" || e.key === "ArrowUp") {
            e.preventDefault();
            active.blur();
            window.isUsingSlider = false;
            return;
        }
    }

    if (window.isUsingSlider) return;

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
        audio: ["musicSlider", "sfxSlider", "soundOn", "soundOff", "closeSettingsAudio"],
        cursor: ["cursorSizeSlider", "cursor1", "cursor2", "cursor3", "cursor4", "validateCursor"],
        background: ["bg1", "bg2", "bg3", "bg4", "closeBackground"],
        ranking: ["tabEasy", "tabHard", "tabExpert", "closeRanking"]
    };

    if (isAudio) {

        const ids = contexts.audio;

        if (typeof window.selectedIndex === "undefined") {
            window.selectedIndex = 0;
        }

        const buttons = ids.map(id => document.getElementById(id)).filter(Boolean);

        if (buttons.length === 0) return;

        if (e.key === "ArrowDown") {
            window.selectedIndex = (window.selectedIndex + 1) % buttons.length;
        }

        if (e.key === "ArrowUp") {
            window.selectedIndex = (window.selectedIndex - 1 + buttons.length) % buttons.length;
        }

        const el = buttons[window.selectedIndex];
        if (el) el.focus();

        return;
    }

    const isTyping =
        active &&
        (active.tagName === "INPUT" ||
            active.tagName === "TEXTAREA" ||
            active.isContentEditable);

    if (isTyping) {

        if (e.key === "ArrowDown" || e.key === "ArrowUp") {
            e.preventDefault();

            active.blur();

            const ids = contexts[window.keyboardContext];
            if (!ids) return;

            const buttons = ids.map(id => document.getElementById(id)).filter(Boolean);
            if (buttons.length === 0) return;

            let startIndex = buttons.length - 1;

            if (e.key === "ArrowDown") {
                window.selectedIndex = (startIndex + 1) % buttons.length;
            }

            if (e.key === "ArrowUp") {
                window.selectedIndex = (startIndex - 1 + buttons.length) % buttons.length;
            }

            const el = buttons[window.selectedIndex];
            if (el) el.focus();

            return;
        }
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