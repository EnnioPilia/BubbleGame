import { updateCursorState } from "./UI.js";

export function initSettingsUI() {

    const settingsButtons = [
        document.getElementById("settingsButtonMenu"),
        document.getElementById("settingsButtonPause")
    ];
    const settingsPopup = document.getElementById("settingsPopup");
    const closeSettings = document.getElementById("closeSettings");

    const openSound = document.getElementById("openSound");
    const openCursor = document.getElementById("openCursor");

    const audioPopup = document.getElementById("audioPopup");
    const cursorPopup = document.getElementById("cursorPopup");

    function isAnyPopupOpen() {
        return document.querySelector(
            "#settingsPopup.active, #audioPopup.active, #cursorPopup.active"
        );
    }
    
    settingsButtons.forEach(btn => {
        btn?.addEventListener("click", (e) => {
            e.stopPropagation();
            settingsPopup.classList.add("active");
            updateCursorState();
        });
    });

    closeSettings?.addEventListener("click", () => {
        settingsPopup.classList.remove("active");

        if (!isAnyPopupOpen()) {
            updateCursorState();
        }
    });

    openSound?.addEventListener("click", (e) => {
        e.stopPropagation();

        settingsPopup.classList.remove("active");
        audioPopup.classList.add("active");

        updateCursorState();
    });

    openCursor?.addEventListener("click", (e) => {
        e.stopPropagation();

        settingsPopup.classList.remove("active");
        cursorPopup.classList.add("active");

        updateCursorState();
    });

    [settingsPopup, audioPopup, cursorPopup].forEach(popup => {
        popup?.addEventListener("click", (e) => {
            e.stopPropagation();
        });
    });
}