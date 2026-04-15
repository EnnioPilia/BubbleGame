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