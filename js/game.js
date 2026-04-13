import { sounds, play, pause } from "./sound.js";
import Bubble from "./bubble.js";
import { toggleCustomCursor } from "./cursor.js";

export default class Game {
    constructor() {
        // état jeu
        this.score = 0;
        this.lifes = 4;
        this.spawnSpeed = 600;
        this.intervalId = null;
        this.isPaused = false;
        this.scoreSaved = false;
        this.heartMilestones = new Set();

        this.currentPlayerName = "";

        // UI
        this.scoreDisplay = document.getElementById('score');
        this.startButton = document.getElementById('startButton');
        this.playerName = document.getElementById('playerName');

        this.restartButton = document.getElementById('restartButton');
        this.rankingButton = document.getElementById('rankingButton');
        this.menuRankingButton = document.getElementById('menuRankingButton');
        this.menuButton = document.getElementById("menuButton");
        this.yourScore = document.getElementById("YourScore");
        this.titleMenu = document.getElementById("title");

        this.settingsButtonMenu = document.getElementById("settingsButtonMenu");
        this.settingsButtonPause = document.getElementById("settingsButtonPause");

        this.pauseButton = document.getElementById("pauseButton");
        this.resumeButton = document.getElementById("resumeButton");

        // ranking
        this.rankingPopup = document.getElementById("rankingPopup");
        this.rankingList = document.getElementById("rankingList");
        this.closeRanking = document.getElementById("closeRanking");

        // gameplay
        this.specialStartDelay = 10000;
        this.gameStartTime = Date.now();
        this.lastSpecialSpawn = 0;
        this.specialCooldown = 17000;

        // events
        this.bindEvents();

        this.setUI("menu");
    }

    /* ================= INIT ================= */

    bindEvents() {
        this.startButton.onclick = () => this.start();
        this.restartButton.onclick = () => this.restart();
        this.pauseButton.onclick = () => this.pauseGame();
        this.resumeButton.onclick = () => this.resumeGame();

        if (this.menuButton) {
            this.menuButton.onclick = () => this.backToMenu();
        }

        this.rankingButton.onclick = (e) => {
            e.stopPropagation();
            this.showRanking();
        };
        if (this.menuRankingButton) {
            this.menuRankingButton.onclick = (e) => {
                e.stopPropagation();
                this.showRanking();
            };
        }

        this.closeRanking.onclick = () => this.hideRanking();

        document.addEventListener("click", (e) => {

            if (this.rankingPopup.style.display === "flex") {

                if (e.target.closest("#rankingPopup > *")) return;

                this.hideRanking();
            }
        });
    }
    resetGameState() {
        this.score = 0;
        this.lifes = 4;
        this.spawnSpeed = 600;
        this.isPaused = false;
        this.scoreSaved = false;
        this.gameStartTime = Date.now();
        this.lastSpecialSpawn = 0;
        this.heartMilestones.clear();
    }

    clearBubbles() {
        document.querySelectorAll('.bubble').forEach(b => b.remove());
    }

    /* ================= UI ================= */

    setUI(state) {

        // 🔥 RESET GLOBAL (très important)
        this.scoreDisplay.style.display = "none";
        this.yourScore.style.display = "none";
        this.yourScore.innerHTML = "";
        document.body.classList.remove("gameover", "pause");

        const elements = [
            this.startButton,
            this.menuRankingButton,
            this.menuSoundButton,
            this.pauseButton,
            this.resumeButton,
            this.restartButton,
            this.menuButton,
            this.rankingButton,
            this.settingsButtonMenu,
            this.settingsButtonPause,
            this.playerName,
            this.titleMenu,
            this.cursorButton
        ];

        elements.forEach(el => el && (el.style.display = "none"));

        switch (state) {
            case "menu":
                this.startButton.style.display = "block";
                this.menuRankingButton.style.display = "block";
                this.settingsButtonMenu.style.display = "block";
                this.playerName.style.display = "block";
                this.titleMenu.style.display = "block";
                break;

            case "game":
                this.pauseButton.style.display = "block";
                this.scoreDisplay.style.display = "block";

                break;

            case "pause":
                this.resumeButton.style.display = "block";
                this.restartButton.style.display = "block";
                this.menuButton.style.display = "block";
                this.scoreDisplay.style.display = "block";
                this.settingsButtonPause.style.display = "block";
                break;

            case "gameover":
                this.restartButton.style.display = "block";
                this.menuButton.style.display = "block";
                this.rankingButton.style.display = "block";
                this.hideLifes();
                break;
        }
    }

    hideLifes() {
        const life1 = document.getElementById("life1");
        const life2 = document.getElementById("life2");
        const life3 = document.getElementById("life3");

        [life1, life2, life3].forEach(l => {
            l.style.display = "none";
            l.classList.remove("pulse");
        });
    }
    displayLifes() {
        const life1 = document.getElementById("life1");
        const life2 = document.getElementById("life2");
        const life3 = document.getElementById("life3");

        [life1, life2, life3].forEach(l => {
            l.style.display = "none";
            l.classList.remove("pulse");
        });

        if (this.lifes <= 3) life1.style.display = "block";
        if (this.lifes <= 2) life2.style.display = "block";

        if (this.lifes <= 1) {
            life3.style.display = "block";

            [life1, life2, life3].forEach(l => l.classList.add("pulse"));

            pause(sounds.musicGame);
            play(sounds.stress);
        }
    }

    /* ================= GAME ================= */

    start() {
        this.clearBubbles();
        this.resetGameState();

        this.currentPlayerName = this.playerName.value || "Anonyme";
        this.scoreDisplay.textContent = this.score;

        this.setUI("game");

        pause(sounds.musicMenu);
        play(sounds.musicGame);

        this.displayLifes();
        this.run();
    }

    restart() {
        this.clearBubbles();
        this.resetGameState();

        this.playerName.value = this.currentPlayerName;
        this.scoreDisplay.textContent = this.score;

        document.getElementById("gameOverBackground").style.display = "none";

        this.setUI("game");

        pause(sounds.gameOver);
        pause(sounds.musicMenu);
        play(sounds.musicGame);

        this.displayLifes();
        this.run();
    }

    run() {
        clearInterval(this.intervalId);

        this.intervalId = setInterval(() => {
            if (!this.isPaused) {
                this.spawnBubble();
                this.checkLife();
            }
        }, this.spawnSpeed);
    }

    spawnBubble() {
        const now = Date.now();

        let forceSpecial = false;

        if (now - this.gameStartTime > this.specialStartDelay) {
            if (now - this.lastSpecialSpawn > this.specialCooldown) {
                if (Math.random() < 0.3) {
                    forceSpecial = true;
                    this.lastSpecialSpawn = now;
                }
            }
        }

        new Bubble(this, forceSpecial);
    }

    spawnHeart() {
        new Bubble(this, false, true);
    }

    increaseScore() {
        this.score++;
        this.scoreDisplay.textContent = this.score;

        let newSpeed = this.spawnSpeed;

        const milestones = [40, 60, 80,
            100, 120, 140,
            160, 180, 190,
            200, 210, 220,
            230, 240, 260,
            300, 320, 350,
            400, 450, 500];

        if (milestones.includes(this.score) && !this.heartMilestones.has(this.score)) {
            this.spawnHeart();
            this.heartMilestones.add(this.score);
        }

        if (this.score >= 200) newSpeed = 300;
        else if (this.score >= 180) newSpeed = 330;
        else if (this.score >= 150) newSpeed = 350;
        else if (this.score >= 100) newSpeed = 380;
        else if (this.score >= 50) newSpeed = 420;
        else if (this.score >= 30) newSpeed = 450;
        else if (this.score >= 10) newSpeed = 500;

        if (newSpeed !== this.spawnSpeed) {
            this.spawnSpeed = newSpeed;
            this.run();
        }
    }

    pauseGame() {
        if (this.isPaused) return;

        this.isPaused = true;
        this.setUI("pause");

        pause(sounds.musicGame);
        pause(sounds.stress);

        document.querySelectorAll('.bubble').forEach(b => {
            b.style.animationPlayState = 'paused';
            b.instance?.pause();
        });
    }

    resumeGame() {
        if (!this.isPaused) return;

        this.isPaused = false;
        this.setUI("game");

        if (this.lifes <= 1) {
            play(sounds.stress);
        } else {
            play(sounds.musicGame);
        }

        document.querySelectorAll('.bubble').forEach(b => {
            b.style.animationPlayState = 'running';
            b.instance?.resume();
        });
    }

    checkLife() {
        document.querySelectorAll('.bubble').forEach(b => {
            const instance = b.instance;

            if (!instance || instance.counted || instance.isSpecial || instance.isHeart || instance.isBad) return;

            const rect = b.getBoundingClientRect();

            if (rect.top + rect.height < 0) {
                instance.counted = true;
                this.lifes--;

                b.remove();
                this.displayLifes();

                play(sounds.error);
            }
        });

        if (this.lifes <= 0) {
            this.gameOver();
        }
    }

    gameOver() {
        clearInterval(this.intervalId);

        play(sounds.gameOver);
        pause(sounds.musicGame);
        pause(sounds.stress);

        this.clearBubbles();

        document.getElementById("gameOverBackground").style.display = "block";

        this.setUI("gameover");

        if (!this.scoreSaved) {
            let scores = JSON.parse(localStorage.getItem("scores")) || [];

            scores.push({
                name: this.currentPlayerName,
                score: this.score
            });

            scores.sort((a, b) => b.score - a.score);
            scores = scores.slice(0, 10);

            localStorage.setItem("scores", JSON.stringify(scores));
            this.scoreSaved = true;
        }

        this.yourScore.style.display = "block";
        this.yourScore.innerHTML = `
            <div class="gameover-title">GAME OVER</div>
            <div class="gameover-score">Score : <span>${this.score}</span></div>
        `;
    }

    backToMenu() {
        clearInterval(this.intervalId);

        this.clearBubbles();
        this.resetGameState();

        document.getElementById("gameOverBackground").style.display = "none";

        this.yourScore.style.display = "none";
        this.scoreDisplay.textContent = "0";

        this.setUI("menu");

        pause(sounds.musicGame);
        pause(sounds.gameOver);
        play(sounds.musicMenu);

        this.displayLifes();
    }

    /* ================= RANKING ================= */


    showRanking() {
        let scores = JSON.parse(localStorage.getItem("scores")) || [];

        this.rankingList.innerHTML = "";

        scores.forEach((s, i) => {
            const div = document.createElement("div");
            div.textContent = `${i + 1}. ${s.name} - ${s.score}`;
            this.rankingList.appendChild(div);
        });

        this.rankingPopup.style.display = "flex";
        toggleCustomCursor(false);
    }

    hideRanking() {
        this.rankingPopup.style.display = "none";
        toggleCustomCursor(true);
    }
}
