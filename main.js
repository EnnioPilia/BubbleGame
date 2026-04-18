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

let isEasy = true;

difficultyButton.addEventListener("click", () => {
    isEasy = !isEasy;

    if (isEasy) {
        difficultyText.textContent = "EASY";
        difficultyText.classList.remove("hard");
        difficultyText.classList.add("easy");
        game.difficulty = "easy";
    } else {
        difficultyText.textContent = "HARD";
        difficultyText.classList.remove("easy");
        difficultyText.classList.add("hard");
        game.difficulty = "hard";
    }
});

let currentTarget = null;

function updateAim() {
    const game = window.gameInstance;

    if (!game || !game.isAimActive || game.isPaused) {
        requestAnimationFrame(updateAim);
        return;
    }

    const cursor = document.getElementById("customCursor");
    if (!cursor) {
        requestAnimationFrame(updateAim);
        return;
    }

    if (!currentTarget || !document.body.contains(currentTarget)) {
        const bubbles = document.querySelectorAll(".bubble");

        currentTarget = [...bubbles].find(b => {
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

    if (currentTarget) {
        const rect = currentTarget.getBoundingClientRect();
        const targetX = rect.left + rect.width / 2;
        const targetY = rect.top + rect.height / 2;

        const currentX = parseFloat(cursor.style.left) || targetX;
        const currentY = parseFloat(cursor.style.top) || targetY;

        cursor.style.left = currentX + (targetX - currentX) * 0.2 + "px";
        cursor.style.top = currentY + (targetY - currentY) * 0.2 + "px";
    }

    requestAnimationFrame(updateAim);
}

updateAim();

document.addEventListener("click", (e) => {
    const game = window.gameInstance;
    if (!game || !game.isAimActive || game.isPaused) return;

    e.preventDefault();
    e.stopPropagation();

    if (currentTarget) {
        currentTarget.click();
    }

    currentTarget = null;
});

document.addEventListener("keydown", (e) => {
    const game = window.gameInstance;
    if (!game) return;
    if (e.key === "Escape") {

        if (game.isPaused) {
            game.resumeGame();
        } else {
            game.pauseGame();
        }
    }
});