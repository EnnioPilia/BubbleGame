import { sounds, play, pause } from "./sound.js";
import Bubble from "./bubble.js";
import { showRanking, hideRanking } from "./rankingPopup.js";

const DIFFICULTY = {
    easy: {
        spawnSpeed: 800,
    },
    hard: {
        spawnSpeed: 600,
    }
};

const POWERUPS = {
    easy: {
        slowDuration: 10000,
        slowFactor: 1.8
    },
    hard: {
        slowDuration: 6000,
        slowFactor: 1.6
    }
};

export default class Game {
    constructor() {
        this.score = 0;
        this.lifes = 4;
        this.intervalId = null;
        this.isPaused = false;
        this.scoreSaved = false;

        window.currentGameState = "menu";
        this.difficulty = "easy";

        this.baseSpawnSpeed = 700;
        this.spawnSpeed = 700;

        this.currentPlayerName = "";

        this.slowMilestones = {
            easy: [1 , 30, 70, 120, 170, 220, 260, 300, 350, 400, 450, 450, 500],
            hard: [120, 170, 220, 270, 300, 350, 400, 450, 500]
        };

        this.heartMilestones = {
            easy: [40, 60, 80, 100, 130, 140, 160, 180, 200, 220, 240, 260, 280, 300, 320, 350, 400, 450, 500],
            hard: [80, 100, 140, 180, 220, 240, 260, 280, 300, 320, 340, 360, 380, 400, 450, 500]
        };

        this.heartMilestonesUsed = new Set();

        this.usedSlowMilestones = new Set();
        this.isSlowActive = false;

        this.specialStartDelay = 10000;
        this.gameStartTime = Date.now();
        this.lastSpecialSpawn = 0;
        this.specialCooldown = 17000;

        this.scoreDisplay = document.getElementById('score');
        this.startButton = document.getElementById('startButton');
        this.playerName = document.getElementById('playerName');

        this.restartButton = document.getElementById('restartButton');
        this.difficultyButton = document.getElementById('difficultyButton');
        this.rankingButton = document.getElementById('rankingButton');
        this.menuRankingButton = document.getElementById('menuRankingButton');
        this.menuButton = document.getElementById("menuButton");
        this.yourScore = document.getElementById("YourScore");
        this.titleMenu = document.getElementById("title");

        this.settingsButtonMenu = document.getElementById("settingsButtonMenu");
        this.settingsButtonPause = document.getElementById("settingsButtonPause");

        this.pauseButton = document.getElementById("pauseButton");
        this.resumeButton = document.getElementById("resumeButton");

        this.rankingPopup = document.getElementById("rankingPopup");
        this.rankingList = document.getElementById("rankingList");
        this.closeRanking = document.getElementById("closeRanking");

        this.gameButtons = document.getElementById("gameButtons");
this.gameOverButtons = document.getElementById("gameOverButtons");

// nouveaux boutons
this.restartButtonGameOver = document.getElementById("restartButtonGameOver");
this.menuButtonGameOver = document.getElementById("menuButtonGameOver");
this.rankingButtonGameOver = document.getElementById("rankingButtonGameOver");

        this.isGameOver = false;
        this.bindEvents();

        this.setUI("menu");
    }

    bindEvents() {
        this.startButton.onclick = () => this.start();
        this.restartButton.onclick = () => this.restart();
        this.pauseButton.onclick = () => this.pauseGame();
        this.resumeButton.onclick = () => this.resumeGame();
        const tabEasy = document.getElementById("tabEasy");
        const tabHard = document.getElementById("tabHard");

this.restartButtonGameOver.onclick = () => this.restart();
this.menuButtonGameOver.onclick = () => this.backToMenu();
this.rankingButtonGameOver.onclick = (e) => {
    e.stopPropagation();
    showRanking(this.rankingList, this.difficulty);
};

        if (tabEasy && tabHard) {
            tabEasy.onclick = (e) => {
                e.stopPropagation();
                showRanking(this.rankingList, "easy");
            };

            tabHard.onclick = (e) => {
                e.stopPropagation();
                showRanking(this.rankingList, "hard");

            };
        }

        if (this.menuButton) {
            this.menuButton.onclick = () => this.backToMenu();
        }

        this.rankingButton.onclick = (e) => {
            e.stopPropagation();
            showRanking(this.rankingList, this.difficulty);
        };

        if (this.menuRankingButton) {
            this.menuRankingButton.onclick = (e) => {
                e.stopPropagation();
                showRanking(this.rankingList, this.difficulty);
            };
        }

        this.closeRanking.onclick = () => hideRanking();

        document.addEventListener("click", (e) => {
            if (this.rankingPopup.style.display === "flex") {

                const popupContent = this.rankingPopup.querySelector("div");

                if (popupContent.contains(e.target)) return;

                hideRanking();
            }
        });
    }

    resetGameState() {
        this.score = 0;
        this.lifes = 4;

        const config = DIFFICULTY[this.difficulty] || DIFFICULTY.easy;

        this.baseSpawnSpeed = config.spawnSpeed;
        this.spawnSpeed = this.baseSpawnSpeed;

        this.usedSlowMilestones.clear();
        this.heartMilestonesUsed.clear();

        this.lastSpecialSpawn = 0;

        this.isSlowActive = false;

        this.isPaused = false;
        this.scoreSaved = false;

        this.gameStartTime = Date.now();
        this.isGameOver = false;
    }

    clearBubbles() {
        document.querySelectorAll('.bubble').forEach(b => b.remove());
    }

    setUI(state) {

        this.scoreDisplay.style.display = "none";
        this.yourScore.style.display = "none";
            this.gameButtons.style.display = "none";
    this.gameOverButtons.style.display = "none";
        this.yourScore.innerHTML = "";
        document.body.classList.remove("gameover", "pause");
        window.currentGameState = state;

        const elements = [
            this.startButton,
            this.difficultyButton,
            this.menuRankingButton,
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
            this.difficultyButton.style.display = "block";
            this.menuRankingButton.style.display = "block";
            this.settingsButtonMenu.style.display = "block";
            this.playerName.style.display = "block";
            this.titleMenu.style.display = "block";
            break;

        case "game":
            this.scoreDisplay.style.display = "block";
            this.pauseButton.style.display = "block";
            break;

        case "pause":
            document.body.classList.add("pause");

            this.gameButtons.style.display = "flex";
            this.resumeButton.style.display = "block";
            this.restartButton.style.display = "block";
            this.menuButton.style.display = "block";
            this.settingsButtonPause.style.display = "block";
            this.scoreDisplay.style.display = "block";
            break;

        case "gameover":
            document.body.classList.add("gameover");

            this.gameOverButtons.style.display = "flex";
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

        if (this.isGameOver) return;
        if (this.lifes <= 3) life1.style.display = "block";
        if (this.lifes <= 2) life2.style.display = "block";

        if (this.lifes <= 1) {
            life3.style.display = "block";

            [life1, life2, life3].forEach(l => l.classList.add("pulse"));

            this.updateMusic();
        }
    }

    start() {
        this.clearBubbles();
        this.resetGameState();

        this.currentPlayerName = this.playerName.value || "Anonyme";
        this.scoreDisplay.textContent = this.score;

        this.setUI("game");

        pause(sounds.musicMenu);
        this.updateMusic();

        this.displayLifes();
        this.run();
    }

    restart() {
        this.clearBubbles();
        this.resetGameState();
        clearTimeout(this.slowTimeout);

        this.playerName.value = this.currentPlayerName;
        this.scoreDisplay.textContent = this.score;

        document.getElementById("gameOverBackground").style.display = "none";

        this.setUI("game");

        pause(sounds.gameOver);
        pause(sounds.musicMenu);
        this.updateMusic();

        this.displayLifes();
        this.run();
    }

    run() {
        clearInterval(this.intervalId);

        this.intervalId = setInterval(() => {
            if (!this.isPaused) {

                const now = Date.now();
                const delta = now - this.lastUpdateTime;
                this.lastUpdateTime = now;
                this.gameTime += delta;

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

    spawnSlow() {
        new Bubble(this, false, false, true);
    }

    spawnHeart() {
        new Bubble(this, false, true);
    }

    increaseScore() {
        this.score++;
        this.scoreDisplay.textContent = this.score;

        let newSpeed = this.spawnSpeed;

        if (this.difficulty === "easy") {

            if (
                this.slowMilestones.easy.includes(this.score) &&
                !this.usedSlowMilestones.has(this.score)
            ) {
                this.spawnSlow();
                this.usedSlowMilestones.add(this.score);
            }

            if (
                this.heartMilestones.easy.includes(this.score) &&
                !this.heartMilestonesUsed.has(this.score)
            ) {
                this.spawnHeart();
                this.heartMilestonesUsed.add(this.score);
            }

            if (this.score >= 250) newSpeed = 450;
            else if (this.score >= 200) newSpeed = 500;
            else if (this.score >= 150) newSpeed = 550;
            else if (this.score >= 100) newSpeed = 600;
            else if (this.score >= 50) newSpeed = 650;
            else if (this.score >= 30) newSpeed = 700;
            else if (this.score >= 10) newSpeed = 750;
        }

        else if (this.difficulty === "hard") {

            if (
                this.slowMilestones.hard.includes(this.score) &&
                !this.usedSlowMilestones.has(this.score)
            ) {
                this.spawnSlow();
                this.usedSlowMilestones.add(this.score);
            }

            if (
                this.heartMilestones.hard.includes(this.score) &&
                !this.heartMilestonesUsed.has(this.score)
            ) {
                this.spawnHeart();
                this.heartMilestonesUsed.add(this.score);
            }

            if (this.score >= 250) newSpeed = 300;
            else if (this.score >= 200) newSpeed = 330;
            else if (this.score >= 150) newSpeed = 350;
            else if (this.score >= 100) newSpeed = 380;
            else if (this.score >= 50) newSpeed = 420;
            else if (this.score >= 30) newSpeed = 450;
            else if (this.score >= 10) newSpeed = 500;
        }

        if (newSpeed !== this.spawnSpeed) {
            this.spawnSpeed = newSpeed;
            this.run();
        }
    }

    activateSlow() {
        const config = POWERUPS[this.difficulty];

        if (!this.isSlowActive) {
            this.slowRemaining = config.slowDuration;
        }

        this.isSlowActive = true;
        this.updateMusic();

        this.slowStartTime = Date.now();

        clearTimeout(this.slowTimeout);

        document.querySelectorAll('.bubble').forEach(b => {
            const instance = b.instance;

            if (instance?.isSpecial) return; 

            const current = parseFloat(getComputedStyle(b).animationDuration);

            if (!b.dataset.baseDuration) {
                b.dataset.baseDuration = current;
            }

            b.style.animationDuration =
                (b.dataset.baseDuration * config.slowFactor) + "s";
        });

        this.slowTimeout = setTimeout(() => this.endSlow(), this.slowRemaining);
    }

    endSlow() {
        document.querySelectorAll('.bubble').forEach(b => {
            if (b.dataset.baseDuration) {
                b.style.animationDuration = b.dataset.baseDuration + "s";
            }
        });

        this.isSlowActive = false;
        this.updateMusic();
    }

    getSlowFactor() {
        return POWERUPS[this.difficulty].slowFactor;
    }

    updateMusic() {
        if (this.isPaused || this.isGameOver) return;

        let target = null;

        if (this.isSlowActive) {
            target = sounds.slowMusic;
        } else if (this.lifes <= 1) {
            target = sounds.stress;
        } else {
            target = sounds.musicGame;
        }

        if (!target.paused) return;

        pause(sounds.musicGame);
        pause(sounds.stress);
        pause(sounds.slowMusic);

        play(target);
    }

    pauseGame() {
        if (this.isPaused) return;
        if (this.isSlowActive && this.slowTimeout) {
            clearTimeout(this.slowTimeout);
            this.slowRemaining -= Date.now() - this.slowStartTime;
        }
        this.isPaused = true;
        this.setUI("pause");

        pause(sounds.musicGame);
        pause(sounds.stress);
        pause(sounds.slowMusic);

        document.querySelectorAll('.bubble').forEach(b => {
            b.style.animationPlayState = 'paused';
            b.instance?.pause();
        });
    }

    resumeGame() {
        if (!this.isPaused) return;
        if (this.isSlowActive) {
            this.slowStartTime = Date.now();

            this.slowTimeout = setTimeout(() => this.endSlow(), this.slowRemaining);
        }
        this.isPaused = false;
        this.setUI("game");
        this.updateMusic();

        document.querySelectorAll('.bubble').forEach(b => {
            b.style.animationPlayState = 'running';
            b.instance?.resume();
        });
    }

    checkLife() {
        document.querySelectorAll('.bubble').forEach(b => {
            const instance = b.instance;

            if (!instance || instance.counted || instance.isSpecial || instance.isHeart || instance.isBad || instance.isSlow) return;

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
        this.isGameOver = true;
        clearTimeout(this.slowTimeout);
        this.isSlowActive = false;

        play(sounds.gameOver);
        pause(sounds.musicGame);
        pause(sounds.stress);
        pause(sounds.slowMusic);

        this.clearBubbles();

        document.getElementById("gameOverBackground").style.display = "block";

        this.setUI("gameover");

        if (!this.scoreSaved) {
            const key = `scores_${this.difficulty}`;
            let scores = JSON.parse(localStorage.getItem(key)) || [];

            scores.push({
                name: this.currentPlayerName,
                score: this.score
            });

            scores.sort((a, b) => b.score - a.score);
            scores = scores.slice(0, 10);

            localStorage.setItem(key, JSON.stringify(scores));
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
}
