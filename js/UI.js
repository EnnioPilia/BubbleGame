import { toggleCustomCursor } from "./cursor.js";

export function updateCursorState() {
    const anyPopupOpen = document.querySelector(
        "#settingsPopup.active, #audioPopup.active, #cursorPopup.active, #backgroundPopup.active"
    ) || document.getElementById("rankingPopup")?.style.display === "flex";

    toggleCustomCursor(!anyPopupOpen);
}

function toggleFullscreen() {
    const el = document.documentElement;

    if (!document.fullscreenElement) {
        if (el.requestFullscreen) {
            el.requestFullscreen();
        } else if (el.webkitRequestFullscreen) {
            el.webkitRequestFullscreen();
        }
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        }
    }
}

export function initUI() {

const fsBtn = document.getElementById("fullscreenBtn");
const fsIcon = document.getElementById("fsIcon1");

fsBtn.addEventListener("click", () => {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen();
    } else {
        document.exitFullscreen();
    }
});

document.addEventListener("fullscreenchange", () => {
    if (!fsIcon1) return;

    if (document.fullscreenElement) {
        fsIcon1.src = "assets/image/exit.png";
    } else {
        fsIcon1.src = "assets/image/fullScreen.png";
    }
});

}