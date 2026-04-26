function getSound(id) {
    return document.getElementById(id) || null;
}

export const sounds = {
    bubble: getSound('soundBubbleExplos'),
    button: getSound('soundButton'),
    error: getSound('soundError'),
    gameOver: getSound('soundGameOver'),
    stress: getSound('soundStresse'),
    success: getSound('soundSucess'),
    heart: getSound('soundHeart'),

    musicMenu: getSound("musicMenu"),
    slowMusic: getSound("slowMusic"),
    musicGame: getSound("musicGame"),
    musicTraining: getSound('musicTraining'),

    starMode: getSound('soundStarMode'),
    aimMode: getSound('soundAimMode'),

    star: getSound('soundStar'),
    clicStar: getSound('clicStar'),
    soundAim: getSound('soundAimClick'),
    bubbleTraining: getSound('bubbleTraining'),
};

const musicSounds = [
    sounds.musicMenu,
    sounds.musicGame,
    sounds.slowMusic,
    sounds.musicTraining,
    sounds.starMode,
    sounds.aimMode,
    sounds.stress
];

const sfxSounds = [
    sounds.bubble,
    sounds.error,
    sounds.gameOver,
    sounds.success,
    sounds.heart,
    sounds.star,
    sounds.clicStar,
    sounds.soundAim,
    sounds.button,
    sounds.bubbleTraining
];

let musicVolume = localStorage.getItem("musicVolume");
musicVolume = musicVolume !== null ? parseFloat(musicVolume) : 0.3;

let sfxVolume = localStorage.getItem("sfxVolume");
sfxVolume = sfxVolume !== null ? parseFloat(sfxVolume) : 0.3;

let musicEnabled = localStorage.getItem("musicEnabled");
if (musicEnabled === null) {
    musicEnabled = true;
    localStorage.setItem("musicEnabled", "true");
} else {
    musicEnabled = musicEnabled === "true";
}

let sfxEnabled = localStorage.getItem("sfxEnabled") !== "false";

let soundEnabled = localStorage.getItem("soundEnabled");
if (soundEnabled === null) {
    soundEnabled = true;
} else {
    soundEnabled = soundEnabled === "true";
}

export function applyVolumes() {
    musicSounds.forEach(s => {
        if (s) {
            s.volume = (soundEnabled && musicEnabled)
                ? Math.pow(musicVolume, 2) : 0;
        }
    });

    sfxSounds.forEach(s => {
        if (s) {
            s.volume = (soundEnabled && sfxEnabled)
                ? Math.pow(sfxVolume, 2) : 0;
        }
    });
}

export function setMusicVolume(v) {
    musicVolume = Math.min(1, v);
    localStorage.setItem("musicVolume", musicVolume);
    applyVolumes();
}

export function setSFXVolume(v) {
    sfxVolume = Math.min(1, v);
    localStorage.setItem("sfxVolume", sfxVolume);
    applyVolumes();
}

export function toggleSound() {
    soundEnabled = !soundEnabled;
    localStorage.setItem("soundEnabled", soundEnabled);
    applyVolumes();
    return soundEnabled;
}

export function toggleMusic() {
    musicEnabled = !musicEnabled;
    localStorage.setItem("musicEnabled", musicEnabled);
    applyVolumes();
    return musicEnabled;
}

export function toggleSFX() {
    sfxEnabled = !sfxEnabled;
    localStorage.setItem("sfxEnabled", sfxEnabled);
    applyVolumes();
    return sfxEnabled;
}

export function play(sound) {
    if (!sound || !soundEnabled) return;

    if (sfxSounds.includes(sound) && !sfxEnabled) return;
    if (musicSounds.includes(sound) && !musicEnabled) return;

    sound.currentTime = 0;
    sound.play().catch(() => { });
}

export function pause(sound) {
    if (sound) sound.pause();
}

export function pauseAll() {
    Object.values(sounds).forEach(s => {
        if (s) s.pause();
    });
}

export function getState() {
    return {
        musicVolume,
        sfxVolume,
        musicEnabled,
        sfxEnabled,
        soundEnabled
    };
}

export function initSoundSystem() {
    applyVolumes();
}

document.addEventListener("click", (e) => {
    const btn = e.target.closest("button, .cursor-option, .bg-option, input");

    if (!btn) return;

    play(sounds.button, 0.05);
}, true); 