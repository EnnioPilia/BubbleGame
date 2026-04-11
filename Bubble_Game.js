function getSound(id) {
    return document.getElementById(id) || null;
}

const soundBubble = getSound('soundBubbleExplos');
const soundError = getSound('soundError');
const soundGameOver = getSound('soundGameOver');
const soundStress = getSound('soundStresse');
const musicMenu = document.getElementById("musicMenu");
const musicGame = document.getElementById("musicGame");
const soundToggle = document.getElementById("soundToggle");
const volumeSlider = document.getElementById("volumeSlider");
const soundSucess = document.getElementById("soundSucess");
const soundHeart = document.getElementById("soundHeart");

let soundEnabled = true;

function applyVolume(volume) {
    if (musicMenu) musicMenu.volume = volume;
    if (musicGame) musicGame.volume = volume;
    if (soundStress) soundStress.volume = volume;
    if (soundBubble) soundBubble.volume = volume;
    if (soundError) soundError.volume = volume;
    if (soundGameOver) soundGameOver.volume = volume;
    if (soundSucess) soundSucess.volume = volume;
    if (soundHeart) soundHeart.volume = volume;
}

const savedVolume = localStorage.getItem("volume");
const savedSound = localStorage.getItem("soundEnabled");

let volume = savedVolume !== null ? Math.min(1, parseFloat(savedVolume)) : 0.3;
soundEnabled = savedSound !== null ? savedSound === "true" : true;

if (volumeSlider) {
    volumeSlider.value = volume * 100;
}

applyVolume(soundEnabled ? volume : 0);
soundToggle.textContent = soundEnabled ? "🔊" : "🔇";

if (volumeSlider) {
    volumeSlider.oninput = () => {
        volume = parseFloat(volumeSlider.value) / 100;
        localStorage.setItem("volume", volume);

        if (soundEnabled) {
            applyVolume(volume);
        }
    };
}

if (soundToggle) {
    soundToggle.onclick = () => {
        soundEnabled = !soundEnabled;

        localStorage.setItem("soundEnabled", soundEnabled);

        if (soundEnabled) {
            applyVolume(volume);
            soundToggle.textContent = "🔊";
        } else {
            applyVolume(0);
            soundToggle.textContent = "🔇";
        }
    };
}

class Bubble {
    constructor(game, forceSpecial = false, isHeart = false) {
        this.isHeart = isHeart;

        this.game = game;
        this.counted = false;

        this.element = document.createElement('span');
        this.element.classList.add('bubble');
        this.element.innerHTML = `<div class="bubble-inner"></div>`;

        const isMobile = window.innerWidth < 768;
        const minSize = isMobile ? 70 : 100;
        const maxSize = isMobile ? 140 : 250;


        this.isSpecial = forceSpecial;
        this.isBad = !this.isSpecial && !this.isHeart && Math.random() < 0.45;

        let size;

        if (this.isSpecial) {
            size = window.innerWidth < 768 ? 90 : 130;
        } else {
            size = Math.random() * (maxSize - minSize) + minSize;
        }


        this.element.style.width = size + "px";
        this.element.style.height = size + "px";
        this.element.style.transformOrigin = "center";

        this.element.style.top = window.innerHeight + "px";
        this.element.style.left = Math.random() * (window.innerWidth - size) + "px";

        this.clickCount = 0;
        this.maxClicks = 100;

        const inner = this.element.querySelector('.bubble-inner');

        if (this.isHeart) {
            inner.classList.add("heart");
            inner.innerHTML = "❤️";
        }

        if (!this.isHeart) {
            if (this.isSpecial) {
                inner.style.background = "radial-gradient(circle, violet, cyan)";
                inner.classList.add("special");
            } else if (this.isBad) {
                inner.classList.add("bad-bubble");
            } else {
                let hue;
                do {
                    hue = Math.random() * 360;
                } while (hue < 20 || hue > 340);

                inner.style.background = `hsl(${hue}, 100%, 50%)`;
            }
        }

        if (this.isSpecial) {
            const duration = 8;

            this.element.style.top = Math.random() * (window.innerHeight - size) + "px";
            this.element.style.left = "-150px";

            this.element.style.animation = "none";
            this.element.offsetHeight;

            this.element.style.animation = `animHorizontal ${duration}s linear forwards`;
        } else {
            const screenFactor = window.innerHeight / 800;
            const duration = Math.max(1.5, (this.game.spawnSpeed / 1000) * 6 * screenFactor);
            this.element.style.animation = `anim ${duration}s linear`;
        }

        this.element.addEventListener("click", () => {
            if (this.game.isPaused) return;

            if (this.isHeart) {

                if (soundHeart) {
                    soundHeart.currentTime = 0;
                    soundHeart.play();
                }

                if (this.game.lifes < 4) {
                    this.game.lifes++;
                }

                if (this.game.lifes > 1) {
                    if (soundStress) soundStress.pause();

                    if (musicGame && musicGame.paused) {
                        musicGame.currentTime = 0;
                        musicGame.play();
                    }
                }

                this.game.displayLifes();

                const inner = this.element.querySelector('.bubble-inner');

                inner.style.animation = "none";
                inner.style.transition = "transform 0.15s ease, opacity 0.15s ease";
                inner.style.transform = "scale(0.4)";
                inner.style.opacity = "0";

                setTimeout(() => {
                    this.destroy();
                }, 150);

                return;
            }

            if (this.isSpecial) {

                if (soundSucess) {
                    soundSucess.currentTime = 0;
                    soundSucess.play();
                }

                this.game.score += 1;
                this.game.scoreDisplay.textContent = this.game.score;

                this.clickCount++;

                this.element.style.filter = `brightness(${1 + this.clickCount * 0.11})`;

                const inner = this.element.querySelector('.bubble-inner');

                inner.style.transition = "transform 0.05s ease";
                inner.style.transform = "scale(1.2)";

                setTimeout(() => {
                    inner.style.transform = "scale(1)";
                }, 80);

                if (this.clickCount >= this.maxClicks) {
                    this.destroy();
                }

                return;
            }
            if (this.isBad) {
                if (soundError) {
                    soundError.currentTime = 0;
                    soundError.play();
                }

                this.destroy();

                this.game.lifes = 0;
                this.game.displayLifes();
                this.game.gameOver();

                return;
            }

            if (soundBubble) {
                soundBubble.currentTime = 0;
                soundBubble.play();
            }

            this.game.increaseScore();
            this.destroy();
        });

        document.getElementById("ui").appendChild(this.element);
        this.element.instance = this;

        this.remainingTime = this.isSpecial ? 15000 : 8000;
        this.startTime = Date.now();

        this.timeout = setTimeout(() => this.destroy(), this.remainingTime);
    }

    pause() {
        clearTimeout(this.timeout);
        this.remainingTime -= Date.now() - this.startTime;
    }

    resume() {
        this.startTime = Date.now();
        this.timeout = setTimeout(() => this.destroy(), this.remainingTime);
    }

    destroy() {
        clearTimeout(this.timeout);

        this.element.classList.add("pop");

        setTimeout(() => {
            this.element.remove();
        }, 120);
    }
}

class Game {
    constructor() {
        this.score = 0;
        this.lifes = 4;
        this.spawnSpeed = 600;
        this.intervalId = null;
        this.isPaused = false;
        this.scoreSaved = false;
        this.heartMilestones = new Set();

        this.currentPlayerName = "";

        this.scoreDisplay = document.getElementById('score');
        this.startButton = document.getElementById('startButton');
        this.playerName = document.getElementById('playerName');

        this.restartButton = document.getElementById('restartButton');
        this.rankingButton = document.getElementById('rankingButton');
        this.menuRankingButton = document.getElementById('menuRankingButton');
        this.menuButton = document.getElementById("menuButton");
        this.yourScore = document.getElementById("YourScore");
        this.titleMenu = document.getElementById("title");
        this.menuSoundButton = document.getElementById("menuSoundButton");
        this.soundButton = document.getElementById("soundButton");

        this.specialStartDelay = 10000;
        this.gameStartTime = Date.now();

        this.lastSpecialSpawn = 0;
        this.specialCooldown = 17000;

        this.pauseButton = pauseButton;
        this.resumeButton = resumeButton;

        this.rankingButton.style.display = "none";
        this.restartButton.style.display = "none";
        this.menuButton.style.display = "none";

        this.pauseButton.onclick = () => this.pauseGame();
        this.resumeButton.onclick = () => this.resumeGame();
        this.startButton.onclick = () => this.start();
        this.restartButton.onclick = () => this.restart();

        if (this.menuButton) {
            this.menuButton.onclick = () => this.backToMenu();
        }

        this.rankingPopup = document.getElementById("rankingPopup");
        this.rankingList = document.getElementById("rankingList");
        this.closeRanking = document.getElementById("closeRanking");

        this.rankingButton.onclick = () => this.showRanking(false);

        if (this.menuRankingButton) {
            this.menuRankingButton.onclick = () => this.showRanking(true);
        }

        this.closeRanking.onclick = () => this.hideRanking();
        if (this.menuSoundButton) {
            this.menuSoundButton.onclick = () => {
                const audioPopup = document.getElementById("audioPopup");
                audioPopup.classList.toggle("active");
            };
        }
        this.setUI("menu");
    }

    setUI(state) {
        const playerName = this.playerName;
        const title = this.titleMenu;
        const score = this.scoreDisplay;

        const startButton = this.startButton;
        const menuRankingButton = this.menuRankingButton;
        const menuSoundButton = this.menuSoundButton;

        const pauseButton = this.pauseButton;
        const resumeButton = this.resumeButton;
        const restartButton = this.restartButton;
        const menuButton = this.menuButton;
        const rankingButton = this.rankingButton;
        const soundButton = this.soundButton;

        [
            startButton,
            menuRankingButton,
            menuSoundButton,
            pauseButton,
            resumeButton,
            restartButton,
            menuButton,
            rankingButton,
            soundButton,
            playerName,
            title
        ].forEach(el => {
            if (el) el.style.display = "none";
        });

        switch (state) {
            case "menu":
                startButton.style.display = "block";
                menuRankingButton.style.display = "block";
                menuSoundButton.style.display = "block";
                playerName.style.display = "block";
                title.style.display = "block";
                score.style.display = "none";
                break;

            case "game":
                pauseButton.style.display = "block";
                score.style.display = "block";
                break;

            case "pause":
                resumeButton.style.display = "block";
                restartButton.style.display = "block";
                menuButton.style.display = "block";
                soundButton.style.display = "block";
                score.style.display = "block";
                break;

            case "gameover":
                restartButton.style.display = "block";
                menuButton.style.display = "block";
                rankingButton.style.display = "block";
                score.style.display = "block";
                score.style.display = "none";
                break;
        }
    }

    displayLifes() {
        const life1 = document.getElementById("life1");
        const life2 = document.getElementById("life2");
        const life3 = document.getElementById("life3");

        life1.style.display = "none";
        life2.style.display = "none";
        life3.style.display = "none";

        life1.classList.remove("pulse");
        life2.classList.remove("pulse");
        life3.classList.remove("pulse");

        if (this.lifes <= 3) life1.style.display = "block";
        if (this.lifes <= 2) life2.style.display = "block";
        if (this.lifes <= 1) {
            life3.style.display = "block";

            life1.classList.add("pulse");
            life2.classList.add("pulse");
            life3.classList.add("pulse");

            if (musicGame) {
                musicGame.pause();
                musicGame.currentTime = 0;
            }

            if (soundStress && soundStress.paused) {
                soundStress.currentTime = 0;
                soundStress.play();
            }
        }
    }

    start() {
        document.querySelectorAll('.bubble').forEach(b => b.remove());

        this.currentPlayerName = this.playerName.value || "Anonyme";

        this.score = 0;
        this.lifes = 4;
        this.spawnSpeed = 600;
        this.isPaused = false;
        this.scoreSaved = false;
        this.gameStartTime = Date.now();
        this.lastSpecialSpawn = 0;
        this.displayLifes();

        this.heartMilestones.clear();
        this.scoreDisplay.textContent = this.score;

        this.setUI("game");

        if (musicMenu) {
            musicMenu.pause();
            musicMenu.currentTime = 0;
        }

        if (musicGame) {
            musicGame.currentTime = 0;
            musicGame.play();
        }

        const bg = document.getElementById("gameOverBackground");
        if (bg) bg.style.display = "none";

        this.run();
    }

    restart() {
        document.querySelectorAll('.bubble').forEach(b => b.remove());

        this.score = 0;
        this.lifes = 4;
        this.spawnSpeed = 600;
        this.isPaused = false;
        this.scoreSaved = false;
        this.playerName.value = this.currentPlayerName;
        this.gameStartTime = Date.now();
        this.lastSpecialSpawn = 0;
        this.heartMilestones.clear();
        this.scoreDisplay.textContent = this.score;
        this.yourScore.style.display = "none";
        this.yourScore.innerHTML = "";
        this.setUI("game");

        if (soundGameOver) soundGameOver.pause();
        if (musicMenu) musicMenu.pause();

        if (musicGame) {
            musicGame.currentTime = 0;
            musicGame.play();
        }

        const bg = document.getElementById("gameOverBackground");
        if (bg) bg.style.display = "none";

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

        if (now - this.gameStartTime < this.specialStartDelay) {
            forceSpecial = false;
        } else {
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

        const milestones = [40, 60, 80, 100, 120, 140, 160, 180, 190, 200, 210, 220, 230, 240, 260, 300, 320, 350, 400, 450, 500];

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
        else if (this.score >= 10) newSpeed = 480;
        else if (this.score >= 5) newSpeed = 500;

        if (newSpeed !== this.spawnSpeed) {
            this.spawnSpeed = newSpeed;
            this.run();
        }
    }

    pauseGame() {
        document.body.classList.add("pause");

        if (this.isPaused) return;

        this.isPaused = true;

        this.setUI("pause");

        if (soundStress) soundStress.pause();
        if (musicGame) musicGame.pause();

        document.querySelectorAll('.bubble').forEach(b => {
            b.style.animationPlayState = 'paused';
            if (b.instance) b.instance.pause();
        });
    }

    resumeGame() {
        document.body.classList.remove("pause");

        if (!this.isPaused) return;

        this.isPaused = false;

        this.setUI("game");

        if (this.lifes <= 1) {
            if (musicGame) {
                musicGame.pause();
                musicGame.currentTime = 0;
            }

            if (soundStress) {
                soundStress.currentTime = 0;
                soundStress.play();
            }

        } else {
            if (soundStress) soundStress.pause();

            if (musicGame) {
                musicGame.play();
            }
        }

        document.querySelectorAll('.bubble').forEach(b => {
            b.style.animationPlayState = 'running';
            if (b.instance) b.instance.resume();
        });
    }

    checkLife() {
        document.querySelectorAll('.bubble').forEach(b => {
            const instance = b.instance;

            if (instance && !instance.counted && !instance.isSpecial && !instance.isHeart && !instance.isBad) {
                const rect = b.getBoundingClientRect();

                if (rect.top + rect.height < 0) {
                    instance.counted = true;

                    this.lifes--;
                    b.remove();

                    this.displayLifes();

                    if (soundError) {
                        soundError.currentTime = 0;
                        soundError.play();
                    }
                }
            }
        });

        if (this.lifes <= 0) {
            this.gameOver();
        }
    }

    gameOver() {
        clearInterval(this.intervalId);

        document.body.classList.add("gameover");

        const bg = document.getElementById("gameOverBackground");
        if (bg) bg.style.display = "block";

        if (soundGameOver) soundGameOver.play();
        if (soundStress) soundStress.pause();
        if (musicGame) musicGame.pause();

        const life1 = document.getElementById("life1");
        const life2 = document.getElementById("life2");
        const life3 = document.getElementById("life3");

        life1.style.display = "none";
        life2.style.display = "none";
        life3.style.display = "none";

        life1.classList.remove("pulse");
        life2.classList.remove("pulse");
        life3.classList.remove("pulse");

        if (!this.scoreSaved) {
            let scores = JSON.parse(localStorage.getItem("scores")) || [];

            const name = this.currentPlayerName || "Anonyme";

            scores.push({ name: name, score: this.score });

            scores.sort((a, b) => b.score - a.score);
            scores = scores.slice(0, 10);

            localStorage.setItem("scores", JSON.stringify(scores));

            this.scoreSaved = true;
        }

        document.querySelectorAll('.bubble').forEach(b => b.remove());

        this.setUI("gameover");

        this.yourScore.style.display = "block";
        this.yourScore.innerHTML = `
            <div class="gameover-title">GAME OVER</div>
            <div class="gameover-score">Score : <span>${this.score}</span></div>
        `;
    }

    backToMenu() {
        clearInterval(this.intervalId);

        document.querySelectorAll('.bubble').forEach(b => b.remove());
        document.body.classList.remove("gameover");
        this.score = 0;
        this.lifes = 4;
        this.spawnSpeed = 600;
        this.isPaused = false;
        this.scoreSaved = false;


        this.yourScore.style.display = "none";
        this.yourScore.innerHTML = "";
        this.scoreDisplay.textContent = "0";

        this.setUI("menu");

        if (musicGame) musicGame.pause();
        if (soundGameOver) soundGameOver.pause();

        if (musicMenu) {
            musicMenu.currentTime = 0;
            musicMenu.play();
        }

        const bg = document.getElementById("gameOverBackground");
        if (bg) bg.style.display = "none";

        this.displayLifes();
    }

    showRanking(fromMenu = false) {
        let scores = JSON.parse(localStorage.getItem("scores")) || [];

        this.rankingList.innerHTML = "";

        scores.forEach((s, i) => {
            const div = document.createElement("div");
            div.textContent = `${i + 1}. ${s.name} - ${s.score}`;
            this.rankingList.appendChild(div);
        });

        this.rankingPopup.style.display = "flex";
    }

    hideRanking() {
        this.rankingPopup.style.display = "none";
    }

}

const game = new Game();

document.addEventListener("click", (e) => {
    if (e.target.id === "startButton") return;

    if (musicMenu && musicMenu.paused) {
        musicMenu.play();
        applyVolume(soundEnabled ? volume : 0);
    }
}, { once: true });

document.addEventListener('dblclick', e => e.preventDefault());

const audioPopup = document.getElementById("audioPopup");

game.soundButton.onclick = () => {
    audioPopup.classList.toggle("active");
};

document.addEventListener("click", (e) => {
    if (
        !audioPopup.contains(e.target) &&
        e.target !== soundButton &&
        e.target !== game.menuSoundButton
    ) {
        audioPopup.classList.remove("active");
    }
});

const popup = document.getElementById("audioPopup");
const closeBtn = document.getElementById("closeAudio");

closeBtn.addEventListener("click", () => {
    popup.classList.remove("active");
});

const slider = document.getElementById("volumeSlider");

function updateSlider() {
    const value = slider.value;
    slider.style.background = `linear-gradient(to right, gold ${value}%, white ${value}%)`;
}

slider.addEventListener("input", updateSlider);

updateSlider();