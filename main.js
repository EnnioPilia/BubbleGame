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
        const smoothing = 0.2;
        currentX += dx * smoothing;
        currentY += dy * smoothing;
    }

    cursor.style.left = currentX + "px";
    cursor.style.top = currentY + "px";

    if (window.aimCursor) {
        const aimDx = currentX - aimX;
        const aimDy = currentY - aimY;

        const aimSmoothing = 0.2;

        aimX += aimDx * aimSmoothing;
        aimY += aimDy * aimSmoothing;

        const offsetY = -7.5;

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

        if (!game.isPaused) {
            stopAimTracking();
            resetCursor();
            game.pauseGame();
        } else {
            game.resumeGame();
        }
    }
});