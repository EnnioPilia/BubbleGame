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

window.aimStep = 0;
window.currentTarget = null;

let aimDirX = 0;
let aimDirY = 0;
let aimMoving = false;

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

    const cursor = document.getElementById("customCursor");
if (window.aimStep === 0) {

    window.currentTarget = getNextTarget();

    if (window.currentTarget) {

        const rect = window.currentTarget.getBoundingClientRect();

        const targetX = rect.left + rect.width / 2;
        const targetY = rect.top + rect.height / 2;

        const dx = targetX - currentX;
        const dy = targetY - currentY;

const distance = Math.sqrt(dx * dx + dy * dy); 

        if (distance === 0) return;

  
        aimMoving = true;

        followTarget();

        window.aimStep = 1;
    }


    } else if (window.aimStep === 1) {
aimMoving = false;
        if (window.currentTarget) {
            window.currentTarget.click();
        }
currentX = window.innerWidth / 2;
currentY = window.innerHeight / 2;

cursor.style.left = currentX + "px";
cursor.style.top = currentY + "px";
        window.currentTarget = null;
        window.aimStep = 0;
    }
});

let currentX = window.innerWidth / 2;
let currentY = window.innerHeight / 2;

function followTarget() {
    if (!aimMoving || !window.gameInstance.isAimActive) return;

    const cursor = document.getElementById("customCursor");

    if (!window.currentTarget || !document.body.contains(window.currentTarget)) {
        aimMoving = false;
        resetCursor();
        return;
    }

    const rect = window.currentTarget.getBoundingClientRect();

    const targetX = rect.left + rect.width / 2;
    const targetY = rect.top + rect.height / 2;

    const dx = targetX - currentX;
    const dy = targetY - currentY;

    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < 10) {
        aimMoving = false;

        window.currentTarget.click();

        resetCursor();
        return;
    }

    const speed = 20;

    currentX += (dx / distance) * speed;
    currentY += (dy / distance) * speed;

    cursor.style.left = currentX + "px";
    cursor.style.top = currentY + "px";

    requestAnimationFrame(followTarget);
}
function resetCursor() {
    const cursor = document.getElementById("customCursor");

    currentX = window.innerWidth / 2;
    currentY = window.innerHeight / 2;

    cursor.style.left = currentX + "px";
    cursor.style.top = currentY + "px";

    window.currentTarget = null;
    window.aimStep = 0;
}
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