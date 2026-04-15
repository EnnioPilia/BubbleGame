// sound.js

function getSound(id) {
    return document.getElementById(id) || null;
}

export const sounds = {
    bubble: getSound('soundBubbleExplos'),
    error: getSound('soundError'),
    gameOver: getSound('soundGameOver'),
    stress: getSound('soundStresse'),
    success: getSound('soundSucess'),
    heart: getSound('soundHeart'),
    musicMenu: getSound("musicMenu"),
    slowMusic: getSound("slowMusic"),
    musicGame: getSound("musicGame"),
};

let soundEnabled = localStorage.getItem("soundEnabled") !== "false";
let volume = parseFloat(localStorage.getItem("volume")) || 0.3;

export function applyVolume(vol = volume) {
    Object.values(sounds).forEach(s => {
        if (s) s.volume = vol;
    });
}

export function initSound() {
    applyVolume(soundEnabled ? volume : 0);
}

export function setVolume(v) {
    volume = Math.min(1, v);
    localStorage.setItem("volume", volume);

    if (soundEnabled) applyVolume(volume);
}

export function toggleSound() {
    soundEnabled = !soundEnabled;
    localStorage.setItem("soundEnabled", soundEnabled);

    if (!soundEnabled) {
        Object.values(sounds).forEach(s => {
            if (s) {
                s.pause();
                s.currentTime = 0;
            }
        });
    } else {
        const state = window.currentGameState;

        if (state === "menu") {
            sounds.musicMenu?.play();
        }

        else if (state === "game") {
            sounds.musicGame?.play();
        }

        else if (state === "pause") {
            sounds.musicGame?.play();
        }

        else if (state === "gameover") {
        }
    }

    applyVolume(soundEnabled ? volume : 0);

    return soundEnabled;
}

export function play(sound) {
    if (!soundEnabled || !sound) return;
    sound.currentTime = 0;
    sound.play();
}

export function pause(sound) {
    if (sound) sound.pause();
}

export function getState() {
    return { volume, soundEnabled };
}

