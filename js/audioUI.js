import { setVolume, toggleSound, getState } from "./sound.js";
import { toggleCustomCursor } from "./cursor.js";

export function initAudioUI() {
    const soundToggle = document.getElementById("soundToggle");
    const volumeSlider = document.getElementById("volumeSlider");

    const audioPopup = document.getElementById("audioPopup");
    const closeBtn = document.getElementById("closeAudio");

    const soundButton = document.getElementById("soundButton");
    const menuSoundButton = document.getElementById("menuSoundButton");

    const { volume, soundEnabled } = getState();

    if (volumeSlider) volumeSlider.value = volume * 100;
    if (soundToggle) soundToggle.textContent = soundEnabled ? "🔊" : "🔇";

    [soundButton, menuSoundButton].forEach(btn => {
        if (btn) {
            btn.onclick = (e) => {
                e.stopPropagation();
                audioPopup.classList.add("active");
                toggleCustomCursor(false);
            };
        }
    });

    audioPopup.addEventListener("click", (e) => {
        e.stopPropagation();
    });

    if (closeBtn) {
        closeBtn.onclick = () => {
            audioPopup.classList.remove("active");
            toggleCustomCursor(true);
        };
    }

    document.addEventListener("click", () => {
        audioPopup.classList.remove("active");
        toggleCustomCursor(true); 
    });

    if (volumeSlider) {
        volumeSlider.oninput = () => {
            const v = volumeSlider.value / 100;
            setVolume(v);
            updateSlider(volumeSlider);
        };
    }

    if (soundToggle) {
        soundToggle.onclick = () => {
            const enabled = toggleSound();
            soundToggle.textContent = enabled ? "🔊" : "🔇";
        };
    }

    updateSlider(volumeSlider);
}

function updateSlider(slider) {
    if (!slider) return;

    const value = slider.value;
    slider.style.background =
        `linear-gradient(to right, gold ${value}%, white ${value}%)`;
}