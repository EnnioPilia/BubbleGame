import { toggleCustomCursor } from "./cursor.js";
import { openPopup, closeAllPopups } from "./popupManager.js";

export function showRanking(rankingList, difficulty) {
    const key = `scores_${difficulty}`;
    let scores = JSON.parse(localStorage.getItem(key)) || [];
    document.body.classList.add("no-custom-cursor");

    rankingList.innerHTML = "";

    scores.forEach((s, i) => {
        const div = document.createElement("div");
        div.textContent = `${i + 1}. ${s.name} - ${s.score}`;
        rankingList.appendChild(div);
    });

    openPopup("rankingPopup");
    toggleCustomCursor(false);

    document.getElementById("tabEasy")
        .classList.toggle("active", difficulty === "easy");

    document.getElementById("tabHard")
        .classList.toggle("active", difficulty === "hard");
}

export function hideRanking() {
    document.body.classList.remove("no-custom-cursor");
    closeAllPopups();
    toggleCustomCursor(true);
}