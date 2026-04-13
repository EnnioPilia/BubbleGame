import { initSound, applyVolume, sounds } from "./js/sound.js";
import { initAudioUI } from "./js/audioUI.js";
import { initCursor } from "./js/cursor.js";
import Game from "./js/game.js";

initSound();
initCursor();

const game = new Game();

initAudioUI();

document.addEventListener("click", (e) => {
    if (e.target.id === "startButton") return;

    if (sounds.musicMenu && sounds.musicMenu.paused) {
        sounds.musicMenu.play();
        applyVolume();
    }
}, { once: true });

document.addEventListener("dblclick", e => e.preventDefault());