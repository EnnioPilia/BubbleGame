import { initSound, applyVolume, sounds } from "./js/sound.js";
import { initAudioUI } from "./js/audioUI.js";
import { initCursor } from "./js/cursor.js";
import Game from "./js/game.js";

// 1. init modules
initSound();
initCursor();

// 2. créer le jeu
const game = new Game();

// 3. init UI audio (besoin du game pour les boutons)
initAudioUI();

// 4. activer musique au premier clic (important navigateur)
document.addEventListener("click", (e) => {
    if (e.target.id === "startButton") return;

    if (sounds.musicMenu && sounds.musicMenu.paused) {
        sounds.musicMenu.play();
        applyVolume();
    }
}, { once: true });

// 5. désactiver double clic
document.addEventListener("dblclick", e => e.preventDefault());