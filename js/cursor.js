// cursor.js

let cursor;

export function initCursor() {
    cursor = document.getElementById("customCursor");
    toggleCustomCursor(true);

    const cursorButton = document.getElementById("cursorButton");
    const cursorPopup = document.getElementById("cursorPopup");
    const cursorPreview = document.getElementById("cursorPreview");
    const cursorSlider = document.getElementById("cursorSizeSlider");
    const validateCursorBtn = document.getElementById("validateCursor");
    const playerInput = document.getElementById("playerName");

    const savedCursorSize = localStorage.getItem("cursorSize") || 60;

    if (cursorButton) {
        cursorButton.onclick = (e) => {
            e.stopPropagation();
            cursorPopup.classList.add("active");
            toggleCustomCursor(false);
        };
    }

    if (cursor) {
        cursor.style.width = savedCursorSize + "px";
        cursor.style.height = savedCursorSize + "px";
        cursor.style.display = "block";
    }

    document.addEventListener("mousemove", (e) => {
        if (cursor) {
            cursor.style.left = e.clientX + "px";
            cursor.style.top = e.clientY + "px";
        }
    });

    cursorPopup.addEventListener("click", (e) => {
        e.stopPropagation();
    });

    document.addEventListener("click", () => {
        if (cursorPopup.classList.contains("active")) {
            cursorPopup.classList.remove("active");
            toggleCustomCursor(true);
        }
    });

    cursorButton.onclick = (e) => {
        e.stopPropagation();
        cursorPopup.classList.add("active");
        toggleCustomCursor(false);
    };

    validateCursorBtn.onclick = () => {
        const size = cursorSlider.value;

        if (cursor) {
            cursor.style.width = size + "px";
            cursor.style.height = size + "px";
        }

        localStorage.setItem("cursorSize", size);

        cursorPopup.classList.remove("active");
        toggleCustomCursor(true);
    };

    cursorSlider.value = savedCursorSize;

    cursorSlider.addEventListener("input", () => {
        const size = cursorSlider.value;
        const scale = size / 100;

        cursorPreview.style.transform = `scale(${scale})`;
        updateCursorSlider(cursorSlider);
    });

    updateCursorSlider(cursorSlider);
}

export function toggleCustomCursor(enable) {
    const cursor = document.getElementById("customCursor");

    if (enable) {
        document.body.classList.add("custom-cursor");
        document.body.classList.remove("no-custom-cursor");

        if (cursor) cursor.style.display = "block";
    } else {
        document.body.classList.add("no-custom-cursor");

        if (cursor) cursor.style.display = "none";
    }
}

function updateCursorSlider(slider) {
    const value = slider.value;
    const percent = (value - slider.min) / (slider.max - slider.min) * 100;

    slider.style.background =
        `linear-gradient(to right, gold ${percent}%, white ${percent}%)`;
}


