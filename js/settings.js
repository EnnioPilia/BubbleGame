import { updateCursorState } from "./UI.js";
import { openPopup } from "./popupManager.js";

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
            openPopup("settingsPopup");
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
        openPopup("audioPopup");
        updateCursorState();
    });

    openCursor?.addEventListener("click", (e) => {
        e.stopPropagation();
        openPopup("cursorPopup");
        updateCursorState();
    });

    [settingsPopup, audioPopup, cursorPopup].forEach(popup => {
        popup?.addEventListener("click", (e) => {
            e.stopPropagation();
        });
    });
}