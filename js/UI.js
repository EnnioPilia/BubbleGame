import { toggleCustomCursor } from "./cursor.js";

export function updateCursorState() {
    const anyPopupOpen = document.querySelector(
        "#settingsPopup.active, #audioPopup.active, #cursorPopup.active"
    );

    toggleCustomCursor(!anyPopupOpen);
}

export function initUI() {
    document.addEventListener("click", () => {
        document.querySelectorAll(
            "#settingsPopup, #audioPopup, #cursorPopup"
        ).forEach(p => p.classList.remove("active"));

        updateCursorState();
    });
}