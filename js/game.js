import { sounds, play, pause } from "./sound.js";
import Bubble from "./bubble.js";
import { showRanking, hideRanking } from "./rankingPopup.js";
import { lockCursor, unlockCursor } from "./cursor.js";
import { resetCursorUI } from "./cursor.js";
import { toggleCustomCursor } from "./cursor.js";

const DIFFICULTY = {
    training: { spawnSpeed: 600 },
    easy: { spawnSpeed: 800 },
    hard: { spawnSpeed: 600 },
    expert: { spawnSpeed: 600 }
};

const POWERUPS = {
    easy: {
        slowDuration: 12000,
        slowFactor: 1.8
    },
    hard: {
        slowDuration: 10000,
        slowFactor: 1.5
    }
};

const STAR_CONFIG = {
    easy: 15000,
    hard: 14000,
    expert: 13000
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
        this.trainingDifficulty = "easy";

        this.baseSpawnSpeed = 700;
        this.spawnSpeed = 700;

        this.currentPlayerName = "";

        this.heartMilestones = {
            easy: [40, 60, 80, 100, 120, 140, 160, 180, 200, 220, 300, 350, 450, 500, 650, 700],
            hard: [80, 100, 140, 180, 210, 380, 550, 650, 700, 750],
            expert: [100, 150, 200, 400, 600]
        };

        this.slowMilestones = {
            easy: [30, 120, 210, 330, 510, 680],
            hard: [90, 170, 255, 410, 540, 620],
            // expert: [100, 200, 380]
        };

        this.aimMilestones = {
            easy: [70, 170, 480, 640, 700],
            hard: [120, 220, 390, 580],
            // expert: [120, 400, 580]
        };

        this.starMilestones = {
            easy: [220, 360, 520, 650],
            hard: [260, 420, 620, 750],
            expert: [250, 450, 650]
        };

        this.heartMilestonesUsed = new Set();
        this.usedSlowMilestones = new Set();
        this.starMilestonesUsed = new Set();
        this.aimMilestonesUsed = new Set();

        this.specialStartDelay = 10000;
        this.gameStartTime = Date.now();

        this.lastSpecialSpawn = 0;
        this.specialCooldown = 17000;

        this.isSlowActive = false;
        this.isStarActive = false;
        this.starTimeout = null;
        this.isAimActive = false;
        this.aimTimeout = null;
        this.currentTarget = null;

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
        this.trainingButton = document.getElementById("trainingDifficultyButton");

        this.pauseButton = document.getElementById("pauseButton");
        this.trainingDifficultyButton = document.getElementById("trainingDifficultyButton");
        this.bestScoreTraining = document.getElementById("bestScoreTraining");
        this.resumeButton = document.getElementById("resumeButton");

        this.rankingPopup = document.getElementById("rankingPopup");
        this.rankingList = document.getElementById("rankingList");
        this.closeRanking = document.getElementById("closeRanking");

        this.gameButtons = document.getElementById("gameButtons");
        this.gameOverButtons = document.getElementById("gameOverButtons");

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
        const tabExpert = document.getElementById("tabExpert");

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

        if (tabExpert) {
            tabExpert.onclick = (e) => {
                e.stopPropagation();
                showRanking(this.rankingList, "expert");
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

        this.trainingButton.onclick = () => {
            const modes = ["easy", "medium", "hard"];
            let index = modes.indexOf(this.trainingDifficulty);

            index = (index + 1) % modes.length;
            this.trainingDifficulty = modes[index];

            this.trainingButton.textContent = "MODE : " + this.trainingDifficulty.toUpperCase();
            this.updateBestScoreDisplay();
        };
    }

    resetGameState() {
        this.score = 0;
        this.lifes = 4;
        this.lastSpecialSpawn = 0;
        this.currentTarget = null;
        this.lastUpdateTime = Date.now();
        this.gameTime = 0;
        const config = DIFFICULTY[this.difficulty] || DIFFICULTY.easy;

        this.baseSpawnSpeed = config.spawnSpeed;
        this.spawnSpeed = this.baseSpawnSpeed;

        this.usedSlowMilestones.clear();
        this.heartMilestonesUsed.clear();
        this.starMilestonesUsed.clear();
        this.aimMilestonesUsed.clear();

        this.isSlowActive = false;

        this.isAimActive = false;
        clearTimeout(this.aimTimeout);
        this.aimTimeout = null;

        this.isStarActive = false;
        clearTimeout(this.starTimeout);
        this.starTimeout = null;

        this.isPaused = false;
        this.scoreSaved = false;

        this.gameStartTime = Date.now();
        this.isGameOver = false;

        if (this.difficulty === "training") {
            this.applyTrainingSettings();
        }
    }

    applyTrainingSettings() {
        if (this.trainingDifficulty === "easy") {
            this.spawnSpeed = 500;
        } else if (this.trainingDifficulty === "medium") {
            this.spawnSpeed = 400;
        } else if (this.trainingDifficulty === "hard") {
            this.spawnSpeed = 300;
        }
    }

    clearBubbles() {
        document.querySelectorAll('.bubble').forEach(b => b.remove());
    }

    setUI(state) {

        this.scoreDisplay.style.display = "none";
        this.yourScore.style.display = "none";
        this.gameButtons.style.display = "none";
        this.gameOverButtons.style.display = "none";
        this.trainingDifficultyButton.style.display = "none";
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
            this.cursorButton,
            this.bestScoreTraining
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
                window.keyboardContext = "game";
                if (this.difficulty === "training") {
                    this.trainingButton.style.display = "block";
                    this.bestScoreTraining.style.display = "block";
                } else {
                    this.trainingButton.style.display = "none";
                    this.bestScoreTraining.style.display = "none";
                }
                break;

            case "pause":
                document.body.classList.add("pause");

                this.gameButtons.style.display = "flex";
                this.resumeButton.style.display = "block";
                this.restartButton.style.display = "block";
                this.menuButton.style.display = "block";
                this.settingsButtonPause.style.display = "block";
                this.scoreDisplay.style.display = "block";
                window.keyboardContext = "pause";
                break;

            case "gameover":
                document.body.classList.add("gameover");
                window.keyboardContext = "gameover";
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

        this.currentPlayerName = this.playerName.value || "John Doe";
        this.scoreDisplay.textContent = this.score;

        this.setUI("game");

        if (this.difficulty === "training") {
            document.body.classList.add("training-mode");
        } else {
            document.body.classList.remove("training-mode");
        }

        if (this.difficulty === "training") {
            this.updateBestScoreDisplay();
        }
        pause(sounds.musicMenu);
        this.updateMusic();

        this.displayLifes();
        this.run();
    }

    restart() {
        document.body.classList.remove("slow-mode");
        document.body.classList.remove("star-active");
        document.body.classList.remove("aim-mode");
        this.resetGameState();
        this.clearBubbles();
        const aimCursor = document.getElementById("aimCursor");
        if (aimCursor) aimCursor.style.display = "none";

        clearTimeout(this.slowTimeout);
        this.isStarActive = false;

        clearTimeout(this.starTimeout);
        this.starTimeout = null;

        this.isAimActive = false;
        clearTimeout(this.aimTimeout);

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

        if (this.difficulty === "training") {
            new Bubble(this, false, false, false, false, false);
            return;
        }
        if (now - this.gameStartTime > this.specialStartDelay) {
            if (now - this.lastSpecialSpawn > this.specialCooldown) {
                if (!this.isStarActive && !this.isAimActive && Math.random() < 0.3) {
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

    spawnStar() {
        new Bubble(this, false, false, false, true);
    }

    spawnAim() {
        new Bubble(this, false, false, false, false, true);
    }

    increaseScore() {
        this.score++;

        this.scoreDisplay.textContent = this.score;
        let newSpeed = this.spawnSpeed;

        if (this.difficulty === "easy") {

            if (
                !this.isAimActive &&
                this.starMilestones[this.difficulty].includes(this.score) &&
                !this.starMilestonesUsed.has(this.score)
            ) {
                this.spawnStar();
                this.starMilestonesUsed.add(this.score);
            }

            if (
                this.aimMilestones[this.difficulty].includes(this.score) &&
                !this.aimMilestonesUsed.has(this.score)
            ) {
                this.spawnAim();
                this.aimMilestonesUsed.add(this.score);
            }

            if (
                !this.isAimActive &&
                this.slowMilestones[this.difficulty].includes(this.score) &&
                !this.usedSlowMilestones.has(this.score)
            ) {
                this.spawnSlow();
                this.usedSlowMilestones.add(this.score);
            }

            if (
                !this.isAimActive &&
                this.heartMilestones[this.difficulty].includes(this.score) &&
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
                !this.isAimActive &&
                this.starMilestones[this.difficulty].includes(this.score) &&
                !this.starMilestonesUsed.has(this.score)
            ) {
                this.spawnStar();
                this.starMilestonesUsed.add(this.score);
            }

            if (
                this.aimMilestones[this.difficulty].includes(this.score) &&
                !this.aimMilestonesUsed.has(this.score)
            ) {
                this.spawnAim();
                this.aimMilestonesUsed.add(this.score);
            }

            if (
                !this.isAimActive &&
                this.slowMilestones[this.difficulty].includes(this.score) &&
                !this.usedSlowMilestones.has(this.score)
            ) {
                this.spawnSlow();
                this.usedSlowMilestones.add(this.score);
            }

            if (
                !this.isAimActive &&
                this.heartMilestones[this.difficulty].includes(this.score) &&
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

        else if (this.difficulty === "expert") {

            if (
                this.starMilestones.expert?.includes(this.score) &&
                !this.starMilestonesUsed.has(this.score)
            ) {
                this.spawnStar();
                this.starMilestonesUsed.add(this.score);
            }

            if (
                this.heartMilestones.expert?.includes(this.score) &&
                !this.heartMilestonesUsed.has(this.score)
            ) {
                this.spawnHeart();
                this.heartMilestonesUsed.add(this.score);
            }

            if (this.score >= 200) newSpeed = 300;
            else if (this.score >= 150) newSpeed = 350;
            else if (this.score >= 100) newSpeed = 400;
            else if (this.score >= 50) newSpeed = 450;
        }

        if (newSpeed !== this.spawnSpeed) {
            this.spawnSpeed = newSpeed;
            this.run();
        }
    }

    activateAim() {

        pause(sounds.musicGame);
        pause(sounds.stress);
        pause(sounds.slowMusic);
        pause(sounds.starMode);
        play(sounds.aimMode);

        lockCursor();

        this.currentTarget = null;
        this.aimStartTime = Date.now();
        this.aimRemaining = 9000;

        const aimCursor = document.getElementById("aimCursor");
        if (aimCursor) aimCursor.style.display = "block";

        const cursor = document.getElementById("customCursor");
        if (cursor) cursor.style.display = "block";

        if (this.isSlowActive) {
            this.isSlowActive = false;
            document.body.classList.remove("slow-mode");
            clearTimeout(this.slowTimeout);
        }

        if (this.isStarActive) {
            this.isStarActive = false;
            document.body.classList.remove("star-active");
            clearTimeout(this.starTimeout);
            pause(sounds.starMode);
        }

        const flash = document.getElementById("flashEffectAim");
        flash.classList.add("flashAim-active");

        setTimeout(() => {
            flash.classList.remove("flashAim-active");
        }, 2000);


        cursor.style.left = (window.innerWidth / 2) + "px";
        cursor.style.top = (window.innerHeight / 2) + "px";

        this.isAimActive = true;
        document.body.classList.add("aim-mode");

        document.querySelectorAll('.bubble').forEach(b => {
            const instance = b.instance;
            if (instance) instance.counted = true;
            b.remove();
        });

        clearTimeout(this.aimTimeout);

        this.aimTimeout = setTimeout(() => {
            this.endAim();
        }, this.aimRemaining);
    }

    endAim() {
        window.aimStep = 0;
        window.currentTarget = null;
        unlockCursor();
        const aimCursor = document.getElementById("aimCursor");
        if (aimCursor) aimCursor.style.display = "none";
        const cursor = document.getElementById("customCursor");

        cursor.style.left = window.innerWidth / 2 + "px";
        cursor.style.top = window.innerHeight / 2 + "px";

        document.body.classList.remove("no-custom-cursor");

        this.isAimActive = false;
        document.body.classList.remove("aim-mode");

        pause(sounds.aimMode);

        document.querySelectorAll('.bubble').forEach(b => {
            const instance = b.instance;
            if (instance) instance.counted = true;
            b.remove();
        });

        window.currentTarget = null;

        if (window.stopAimTracking) {
            window.stopAimTracking();
        }

        const flash = document.getElementById("flashEffectAim");
        flash.classList.add("flashAim-active");

        setTimeout(() => {
            flash.classList.remove("flashAim-active");
        }, 800);

        this.updateMusic();
    }

    activateSlow() {
        const config = POWERUPS[this.difficulty];

        if (!this.isSlowActive) {
            this.slowRemaining = config.slowDuration;
        }

        this.isSlowActive = true;
        document.body.classList.add("slow-mode");
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
        document.body.classList.remove("slow-mode");
        document.querySelectorAll('.bubble').forEach(b => {
            const instance = b.instance;
            if (!instance || instance.isSpecial) return;

            const rect = b.getBoundingClientRect();
            const currentTop = rect.top;

            b.style.animation = "none";
            b.style.top = currentTop + "px";
            b.offsetHeight;

            const screenFactor = window.innerHeight / 800;
            let baseSpeed = this.spawnSpeed;

            let duration = Math.max(1.5, (baseSpeed / 1000) * 6 * screenFactor);

            if (instance.isHeart && this.difficulty === "easy") {
                duration *= 1.4;
            }

            if (instance.isStar) {
                duration = this.difficulty === "easy" ? 6 : 5;
            }

            b.style.animation = `anim ${duration}s linear forwards`;
        });

        this.isSlowActive = false;
        this.updateMusic();
    }

    getSlowFactor() {
        return POWERUPS[this.difficulty].slowFactor;
    }

    activateStar() {
        if (this.isSlowActive) {
            this.isSlowActive = false;

            document.body.classList.remove("slow-mode");
            clearTimeout(this.slowTimeout);
        }

        this.isStarActive = true;

        this.starRemaining = STAR_CONFIG[this.difficulty];
        this.starStartTime = Date.now();
        document.body.classList.add("star-active");

        pause(sounds.musicGame);
        pause(sounds.stress);
        pause(sounds.slowMusic);

        play(sounds.starMode);

        clearTimeout(this.starTimeout);

        this.starTimeout = setTimeout(() => {
            this.endStar();
        }, this.starRemaining);
    }

    endStar() {
        this.isStarActive = false;
        document.body.classList.remove("star-active");

        document.querySelectorAll('.bubble').forEach(b => {
            const instance = b.instance;

            if (instance) instance.counted = true;

            b.remove();
        });

        const flash = document.getElementById("flashEffect");
        flash.classList.add("flash-active");

        setTimeout(() => {
            flash.classList.remove("flash-active");
        }, 300);

        pause(sounds.starMode);
        this.updateMusic();
    }

    updateMusic() {
        if (this.isPaused || this.isGameOver) return;

        if (window.currentGameState === "menu") {
            pause(sounds.musicGame);
            pause(sounds.stress);
            pause(sounds.slowMusic);
            pause(sounds.starMode);
            pause(sounds.aimMode);
            pause(sounds.musicTraining);

            play(sounds.musicMenu);
            return;
        }

        if (this.difficulty === "training") {
            if (!sounds.musicTraining.paused) return;

            pause(sounds.musicGame);
            pause(sounds.stress);
            pause(sounds.slowMusic);
            pause(sounds.starMode);
            pause(sounds.aimMode);

            play(sounds.musicTraining);

            return;
        }

        if (this.isAimActive) {
            if (!sounds.aimMode.paused) return;

            pause(sounds.musicGame);
            pause(sounds.stress);
            pause(sounds.slowMusic);
            pause(sounds.starMode);

            play(sounds.aimMode);
            return;
        }

        if (this.isStarActive) {
            if (!sounds.starMode.paused) return;

            pause(sounds.musicGame);
            pause(sounds.stress);
            pause(sounds.slowMusic);
            pause(sounds.aimMode);
            play(sounds.starMode);
            return;
        }

        let target = null;

        if (this.isSlowActive) {
            target = sounds.slowMusic;
        } else if (this.lifes <= 1) {
            target = sounds.stress;
        } else {
            target = sounds.musicGame;
        }

        if (!target.paused) return;

        pause(sounds.starMode);
        pause(sounds.musicGame);
        pause(sounds.stress);
        pause(sounds.slowMusic);
        pause(sounds.musicMenu);

        play(target);
    }

    pauseGame() {
        if (this.isPaused) return;

        if (this.isAimActive) {
            unlockCursor();
        }
        if (this.isSlowActive && this.slowTimeout) {
            clearTimeout(this.slowTimeout);
            this.slowRemaining -= Date.now() - this.slowStartTime;
        }

        if (this.isStarActive && this.starTimeout) {
            clearTimeout(this.starTimeout);
            this.starRemaining -= Date.now() - this.starStartTime;
        }

        if (this.isAimActive && this.aimTimeout) {
            clearTimeout(this.aimTimeout);
            this.aimRemaining -= Date.now() - this.aimStartTime;
        }

        document.body.classList.add("pause");
        this.isPaused = true;
        this.setUI("pause");

        pause(sounds.musicGame);
        pause(sounds.stress);
        pause(sounds.slowMusic);
        pause(sounds.starMode);
        pause(sounds.aimMode);;
        pause(sounds.musicTraining);

        document.querySelectorAll('.bubble').forEach(b => {
            b.style.animationPlayState = 'paused';
            b.instance?.pause();
        });
    }

    resumeGame() {
        if (!this.isPaused) return;

        if (this.isAimActive) {
            lockCursor();
        }
        if (this.isSlowActive) {
            this.slowStartTime = Date.now();
            this.slowTimeout = setTimeout(() => this.endSlow(), this.slowRemaining);
        }

        if (this.isStarActive) {
            this.starStartTime = Date.now();
            this.starTimeout = setTimeout(() => {
                this.endStar();
            }, this.starRemaining);
        }

        if (this.isAimActive) {
            this.aimStartTime = Date.now();
            this.aimTimeout = setTimeout(() => {
                this.endAim();
            }, this.aimRemaining);
        }

        window.keyboardContext = "game";

        document.body.classList.remove("pause");
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

            if (
                !instance ||
                instance.counted ||
                instance.isSpecial ||
                instance.isHeart ||
                instance.isBad ||
                instance.isStar ||
                instance.isAim
            ) return;

            const rect = b.getBoundingClientRect();

            if (rect.top + rect.height < 0) {
                instance.counted = true;

                if (this.difficulty === "training") {

                    const key = this.getTrainingKey();
                    const best = parseInt(localStorage.getItem(key)) || 0;

                    if (this.score > best) {
                        localStorage.setItem(key, this.score);
                    }

                    this.score = 0;
                    this.scoreDisplay.textContent = 0;

                    this.updateBestScoreDisplay();

                } else {
                    if (!this.isStarActive && !instance.isSlow) {
                        this.lifes--;
                        this.displayLifes();
                        play(sounds.error);
                    }
                }

                b.remove();
            }
        });

        if (this.lifes <= 0) {
            play(sounds.gameOver);
            this.gameOver();
        }
    }

    gameOver() {
        document.body.classList.remove("slow-mode");
        document.body.classList.remove("aim-mode");

        unlockCursor();
        this.isAimActive = false;

        const aimCursor = document.getElementById("aimCursor");
        if (aimCursor) aimCursor.style.display = "none";

        clearInterval(this.intervalId);
        this.isGameOver = true;

        clearTimeout(this.slowTimeout);
        this.isSlowActive = false;

        pause(sounds.musicGame);
        pause(sounds.stress);
        pause(sounds.slowMusic);
        pause(sounds.aimMode);
        pause(sounds.musicTraining);

        this.clearBubbles();

        const explosion = document.getElementById("gameOverBackground");

        explosion.style.display = "block";
        explosion.classList.add("active");

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
        this.yourScore.innerHTML =
            ` <div class="gameover-title">GAME OVER</div>
                <div class="gameover-score">Score : <span>${this.score}</span></div> `;
    }

    backToMenu() {
        document.body.classList.remove("slow-mode");
        document.body.classList.remove("star-active");
        document.body.classList.remove("aim-mode");
        document.body.classList.remove("training-mode");

        resetCursorUI();
        clearInterval(this.intervalId);

        this.clearBubbles();
        this.resetGameState();

        document.getElementById("gameOverBackground").style.display = "none";

        this.yourScore.style.display = "none";
        this.scoreDisplay.textContent = "0";

        this.isStarActive = false;
        clearTimeout(this.starTimeout);

        this.isAimActive = false;
        clearTimeout(this.aimTimeout);

        this.starTimeout = null;
        pause(sounds.starMode);

        this.setUI("menu");

        pause(sounds.musicGame);
        pause(sounds.gameOver);
        pause(sounds.starMode);
        pause(sounds.musicTraining);

        play(sounds.musicMenu);

        this.displayLifes();
    }

    updateBestScoreDisplay() {
        const el = document.getElementById("bestScoreTraining");
        if (!el) return;

        const key = this.getTrainingKey();
        const best = localStorage.getItem(key) || 0;

        el.textContent = "Best Score : " + best;
    }
    getTrainingKey() {
        return `training_best_${this.trainingDifficulty}`;
    }
}
