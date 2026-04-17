import { updateCursorState } from "./UI.js";
import { closeAllPopups, openPopup } from "./popupManager.js";

let cursor;

export function initCursor() {

    cursor = document.getElementById("customCursor");
    const cursorPreview = document.getElementById("cursorPreview");
    const cursorOptions = document.querySelectorAll(".cursor-option");
    let selectedCursor = localStorage.getItem("cursorImage") || "cursor1.png";
    const playerInput = document.getElementById("playerName");

if (playerInput) {
    playerInput.addEventListener("click", (e) => {
        e.stopPropagation(); // 👈 empêche le document.click
    });

    playerInput.addEventListener("focus", () => {
        toggleCustomCursor(false);
    });

    playerInput.addEventListener("blur", () => {
        toggleCustomCursor(true);
    });

    playerInput.addEventListener("mouseenter", () => {
        toggleCustomCursor(false);
    });

    playerInput.addEventListener("mouseleave", () => {
        if (document.activeElement !== playerInput) {
            toggleCustomCursor(true);
        }
    });
}

    if (cursor) {
        cursor.src = "image/" + selectedCursor;
    }
    if (cursorPreview) {
        cursorPreview.src = "image/" + selectedCursor;
    }

    cursorOptions.forEach(option => {
        if (option.dataset.cursor === selectedCursor) {
            option.classList.add("selected");
        }

        option.addEventListener("click", () => {
            selectedCursor = option.dataset.cursor;

            if (cursor) cursor.src = "image/" + selectedCursor;
            if (cursorPreview) cursorPreview.src = "image/" + selectedCursor;

            cursorOptions.forEach(o => o.classList.remove("selected"));
            option.classList.add("selected");

            localStorage.setItem("cursorImage", selectedCursor);
        });
    });

    updateCursorState();

    const cursorButton = document.getElementById("cursorButton");
    const cursorPopup = document.getElementById("cursorPopup");
    const cursorSlider = document.getElementById("cursorSizeSlider");
    const validateCursorBtn = document.getElementById("validateCursor");

    const savedCursorSize = localStorage.getItem("cursorSize") || 60;

    if (cursorButton) {
        cursorButton.onclick = (e) => {
            e.stopPropagation();
            openPopup("cursorPopup");
            updateCursorState();
        };
    }

    if (cursor) {
        cursor.style.width = savedCursorSize + "px";
        cursor.style.height = savedCursorSize + "px";
    }

    document.addEventListener("mousemove", (e) => {
        if (cursor) {
            cursor.style.left = e.clientX + "px";
            cursor.style.top = e.clientY + "px";
        }
    });

    if (cursorPopup) {
        cursorPopup.addEventListener("click", (e) => {
            e.stopPropagation();
        });
    }

    if (validateCursorBtn) {
        validateCursorBtn.onclick = () => {
            const size = cursorSlider.value;

            if (cursor) {
                cursor.style.width = size + "px";
                cursor.style.height = size + "px";
            }

            localStorage.setItem("cursorSize", size);

            closeAllPopups();
            updateCursorState();
        };
    }

    if (cursorSlider) {
        cursorSlider.value = savedCursorSize;

        cursorSlider.addEventListener("input", () => {
            const size = cursorSlider.value;
            const scale = size / 100;

            if (cursorPreview) {
                cursorPreview.style.transform = `scale(${scale})`;
            }

            updateCursorSlider(cursorSlider);
        });

        updateCursorSlider(cursorSlider);
    }
}

export function toggleCustomCursor(enable) {
    const cursor = document.getElementById("customCursor");

    if (enable) {
        document.body.classList.add("custom-cursor");
        document.body.classList.remove("no-custom-cursor");

        if (cursor) cursor.style.display = "block";
    } else {
        document.body.classList.add("no-custom-cursor");
        document.body.classList.remove("custom-cursor");

        if (cursor) cursor.style.display = "none";
    }
}

function updateCursorSlider(slider) {
    const value = slider.value;
    const percent = (value - slider.min) / (slider.max - slider.min) * 100;

    slider.style.background =
        `linear-gradient(to right, gold ${percent}%, white ${percent}%)`;
}
