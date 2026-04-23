import { toggleSound, getState, setMusicVolume, setSFXVolume, applyVolumes } from "./sound.js";
import { closeAllPopups } from "./popupManager.js";

export function initAudioUI() {
    const musicSlider = document.getElementById("musicSlider");
    const sfxSlider = document.getElementById("sfxSlider");

    const btnOn = document.getElementById("soundOn");
    const btnOff = document.getElementById("soundOff");

    const applyBtn = document.getElementById("closeSettingsAudio");

    function refresh() {
        const { musicVolume, sfxVolume, soundEnabled } = getState();

        if (musicSlider) musicSlider.value = musicVolume * 100;
        if (sfxSlider) sfxSlider.value = sfxVolume * 100;

        if (btnOn && btnOff) {
            btnOn.classList.toggle("active", soundEnabled);
            btnOff.classList.toggle("active", !soundEnabled);
        }
    }

    if (musicSlider) {
        musicSlider.addEventListener("input", () => {
            setMusicVolume(musicSlider.value / 100);
            applyVolumes();
        });
    }

    if (sfxSlider) {
        sfxSlider.addEventListener("input", () => {
            setSFXVolume(sfxSlider.value / 100);
            applyVolumes();
        });
    }

    refresh();

    btnOn.onclick = () => {
        if (!getState().soundEnabled) {
            toggleSound();
            applyVolumes();

            if (window.gameInstance) {
                window.gameInstance.updateMusic();
            }

            refresh();
        }
    };

    if (btnOff) {
        btnOff.onclick = () => {
            if (getState().soundEnabled) {
                toggleSound();
                applyVolumes();
                refresh();
            }
        };
    }

    if (applyBtn) {
        applyBtn.onclick = () => {
            setMusicVolume(musicSlider.value / 100);
            setSFXVolume(sfxSlider.value / 100);
            applyVolumes();

            closeAllPopups();
        };
    }

    const sliders = document.querySelectorAll(".volumeSlider");

    sliders.forEach(slider => {
        slider.addEventListener("input", () => {
            const value = slider.value;

            slider.style.background =
                `linear-gradient(to right, gold ${value}%, white ${value}%)`;

            if (slider.id === "musicSlider") {
                setMusicVolume(value / 100);
            }
            if (slider.id === "sfxSlider") {
            }
        });

        slider.style.background =
            `linear-gradient(to right, gold ${slider.value}%, white ${slider.value}%)`;
    });
}