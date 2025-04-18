class Bubble {
    constructor(game) {
        this.game = game;
        this.element = document.createElement('span');
        this.element.classList.add('bubble');

        const size = Math.random() * 150 + 100 + "px";
        this.element.style.height = size;
        this.element.style.width = size;

        this.element.style.top = window.innerHeight + "px";
        this.element.style.left = Math.random() * (window.innerWidth - 200) + "px";

        this.isBad = Math.random() < 0.45;
        if (this.isBad) {
            this.element.style.background = "red";
            this.element.classList.add("bad-bubble");
        }

        this.handleClick = this.handleClick.bind(this);
        this.element.addEventListener("click", this.handleClick);

        const duration = Math.max(1.5, (this.game.spawnSpeed / 1000) * 6);
        this.element.style.animation = `anim ${duration}s linear`;

        document.body.appendChild(this.element);
        this.removeAfterTimeout();
    }

    handleClick() {
        if (this.isBad) {
            this.game.gameOver();
            this.element.style.pointerEvents = 'none';
        } else {
            const sound = document.getElementById('soundBubbleExplos');
            sound.currentTime = 0;
            sound.play();

            this.game.increaseScore();
            this.destroy();
        }
    }

    removeAfterTimeout() {
        setTimeout(() => this.destroy(), 8000);
    }

    destroy() {
        this.element.style.transform = 'scale(0.1)';
        this.element.style.transition = 'transform 0.1s ease-in-out';

        setTimeout(() => {
            this.element.remove();
        }, 100);
    }
}

class Game {
    constructor() {
        this.score = 0;
        this.lifes = 4;
        this.spawnSpeed = 600;
        this.intervalId = null;

        this.scoreDisplay = document.querySelector('h3');
        this.restartButton = document.getElementById('restartButton');
        this.gameOverBackground = document.getElementById('gameOverBackground');

        this.restartButton.addEventListener("click", () => {
            this.gameOverBackground.style.display = "none";
            this.start();
        });

        this.start();
    }

    start() {
        this.score = 0;
        this.lifes = 4;
        this.spawnSpeed = 600;
        this.displayLifes();
        stopSound("soundGameOver");

        const life1 = document.getElementById("life1");
        const life2 = document.getElementById("life2");
        const life3 = document.getElementById("life3");

        [life1, life2, life3].forEach(life => life.classList.remove("pulse-life"));

        this.scoreDisplay.textContent = this.score;
        Startbtn.style.display = "none";

        const yourScoreDiv = document.getElementById("YourScore");
        yourScoreDiv.style.display = "none";

        document.body.style.pointerEvents = "auto";
        this.restartButton.style.pointerEvents = "auto";
        this.restartButton.style.display = "none";

        if (this.intervalId) clearInterval(this.intervalId);
        this.runSpawnLoop();
    }

    runSpawnLoop() {
        this.intervalId = setInterval(() => {
            this.spawnBubble();
            this.noMoreLives();
        }, this.spawnSpeed);
    }

    spawnBubble() {
        new Bubble(this);
    }

    increaseScore() {
        this.score++;
        this.scoreDisplay.textContent = this.score;

        let newSpeed = this.spawnSpeed;

        if (this.score >= 50) {
            newSpeed = 350;
        } else if (this.score >= 30) {
            newSpeed = 370;
        } else if (this.score >= 20) {
            newSpeed = 400;
        } else if (this.score >= 10) {
            newSpeed = 450;
        } else if (this.score >= 5) {
            newSpeed = 500;
        }

        if (newSpeed !== this.spawnSpeed) {
            this.spawnSpeed = newSpeed;
            clearInterval(this.intervalId);
            this.runSpawnLoop();
        }
    }

    displayLifes() {
        const life1 = document.getElementById("life1");
        const life2 = document.getElementById("life2");
        const life3 = document.getElementById("life3");

        if (this.lifes === 4 || this.lifes === 0) {
            life1.style.display = "none";
            life2.style.display = "none";
            life3.style.display = "none";
        } else if (this.lifes === 3) {
            life1.style.display = "block";
            const soundError = document.getElementById('soundError');
            soundError.currentTime = 0;
            soundError.play();
        } else if (this.lifes === 2) {
            life2.style.display = "block";
            const soundError = document.getElementById('soundError');
            soundError.currentTime = 0;
            soundError.play();
        } else if (this.lifes === 1) {
            life3.style.display = "block";
            document.getElementById('soundStresse').play();

            life1.classList.add("pulse-life");
            life2.classList.add("pulse-life");
            life3.classList.add("pulse-life");
        }
    }

    noMoreLives() {
        document.querySelectorAll('.bubble').forEach(bubble => {
            if (!bubble.classList.contains('bad-bubble')) {
                const rect = bubble.getBoundingClientRect();

                if (rect.top <= 0) {
                    this.lifes--;
                    this.displayLifes();
                    bubble.remove();
                }
            }
        });

        if (this.lifes === 0) {
            this.gameOver();
        }
    }

    gameOver() {
        stopSound("soundStresse");
        this.gameOverBackground.style.display = "block";
        this.scoreDisplay.textContent = " GAME OVER ";
        document.getElementById('soundGameOver').play();
        document.body.style.pointerEvents = "none";
        clearInterval(this.intervalId);
        document.querySelectorAll('.bubble').forEach(bubble => bubble.remove());

        const yourScoreDiv = document.getElementById("YourScore");
        yourScoreDiv.style.display = "block";
        yourScoreDiv.innerHTML = `Votre score : <span style="color: red;">${this.score}</span>`;

        this.restartButton.style.display = "block";
    }
}

document.addEventListener('dblclick', function (e) {
    e.preventDefault();
});

const Startbtn = document.getElementById('startButton');
Startbtn.addEventListener("click", () => {
    new Game();
});

function stopSound(id) {
    const sound = document.getElementById(id);
    if (sound) {
        sound.pause();
        sound.currentTime = 0;
    }
}
