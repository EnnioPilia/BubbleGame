import { openPopup, goToPopup, closeAllPopups } from "./popupManager.js";
import { updateCursorState } from "./UI.js";

export function initBackgroundPopup() {
    const openBtn = document.getElementById("openBackground");
    const popup = document.getElementById("backgroundPopup");
    const closeBtn = document.getElementById("closeBackground");
    const bgOptions = document.querySelectorAll(".bg-option");

    if (!openBtn || !popup) return;

    openBtn.onclick = () => {
        openPopup("backgroundPopup");
        updateCursorState();
    };

closeBtn.onclick = () => {
    closeAllPopups();   
      updateCursorState();
};

    bgOptions.forEach(img => {
        img.onclick = () => {
            const bg = img.dataset.bg;

            document.body.style.background =
                `url("assets/image/${bg}") center / cover no-repeat`;

            localStorage.setItem("background", bg);

            bgOptions.forEach(i => i.classList.remove("selected"));
            img.classList.add("selected");
        };
    });

    const savedBg = localStorage.getItem("background");
    if (savedBg) {
        document.body.style.background =
            `url("assets/image/${savedBg}") center / cover no-repeat`;

        bgOptions.forEach(img => {
            if (img.dataset.bg === savedBg) {
                img.classList.add("selected");
            }
        });
    }
}