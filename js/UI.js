import { toggleCustomCursor } from "./cursor.js";

export function updateCursorState() {
    const anyPopupOpen = document.querySelector(
        "#settingsPopup.active, #audioPopup.active, #cursorPopup.active, #backgroundPopup.active"
    ) || document.getElementById("rankingPopup")?.style.display === "flex";

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

export function initDifficultyButton(onChange) {
    const btn = document.getElementById("difficultyButton");
    let difficulty = "easy";

    function update() {
        if (difficulty === "easy") {
            btn.innerHTML = "Mode : EASY";
            btn.classList.remove("hard");
            btn.classList.add("easy");
        } else {
            btn.innerHTML = "Mode : HARD";
            btn.classList.remove("easy");
            btn.classList.add("hard");
        }
    }

    btn.onclick = () => {
        difficulty = difficulty === "easy" ? "hard" : "easy";
        update();
        onChange(difficulty);
    };

    update();
}