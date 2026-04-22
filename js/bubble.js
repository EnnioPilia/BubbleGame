import { sounds, play, pause } from "./sound.js";

const AIM_SPEED = 600

export default class Bubble {
    constructor(game, forceSpecial = false, isHeart = false, isSlow = false, isStar = false, isAim = false) {
        this.game = game;
        this.isHeart = isHeart;
        this.isSpecial = forceSpecial;
        this.isSlow = isSlow;
        this.isStar = isStar;
        this.isAim = isAim;
        this.spawnedDuringStar = this.game.isStarActive;

        this.isBad = this.game.difficulty !== "training" && (
            !this.game.isStarActive &&
            !this.game.isAimActive &&
            !this.isSpecial &&
            !this.isHeart &&
            !this.isSlow &&
            !this.isStar &&
            !this.isAim &&
            Math.random() < 0.45
        );

        this.counted = false;
        this.clickCount = 0;
        this.maxClicks = 100;


        this.createElement();
        this.setupStyle();
        this.setupBehavior();

        document.getElementById("ui").appendChild(this.element);
        this.element.instance = this;

        this.startLifetime();
    }

    createElement() {
        this.element = document.createElement('span');
        this.element.classList.add('bubble');
        this.element.innerHTML = `<div class="bubble-inner"></div>`;
        this.inner = this.element.querySelector('.bubble-inner');
    }

    setupStyle() {
        const isMobile = window.innerWidth < 768;
        const minSize = isMobile ? 70 : 100;
        const maxSize = isMobile ? 140 : 250;

        let size;

        if (this.game.difficulty === "training") {
            this.inner.classList.add("training-bubble")

            const ranges = {
                easy: [140, 141],
                medium: [110, 111],
                hard: [95, 96]
            };

            const [min, max] = ranges[this.game.trainingDifficulty];
            size = Math.random() * (max - min) + min;

        } else if (this.isSlow) {
            size = isMobile ? 90 : 160;

        } else if (this.isSpecial) {
            if (this.game.difficulty === "easy") {
                size = isMobile ? 120 : 180;
            } else {
                size = isMobile ? 80 : 110;
            }

        } else if (this.isStar) {
            if (this.game.difficulty === "expert") {
                size = isMobile ? 80 : 100;
            } else {
                size = isMobile ? 90 : 150;
            }

        } else {
            if (this.game.difficulty === "expert") {
                size = isMobile ? 80 : 110;
            } else {
                size = Math.random() * (maxSize - minSize) + minSize;
            }
        }

        this.element.style.width = size + "px";
        this.element.style.height = size + "px";
        this.element.style.top = window.innerHeight + "px";
        this.element.style.left = Math.random() * (window.innerWidth - size) + "px";

        if (this.isHeart) {
            this.inner.classList.add("heart");
            this.element.style.zIndex = "2002";
            this.inner.innerHTML = "❤️";

        } else if (this.isSpecial) {
            this.inner.style.background = "radial-gradient(circle, violet, cyan)";
            this.inner.classList.add("special");

        } else if (this.isSlow) {
            this.element.style.zIndex = "2001";
            this.inner.classList.add("slow-bubble");

        } else if (this.isAim) {
            this.element.style.zIndex = "2001";
            this.inner.style.background = "url('image/viseur.png') no-repeat center";
            this.inner.style.backgroundSize = "contain";
            this.inner.style.opacity = "1";
            this.inner.style.border = "none";
            this.element.classList.add("aim-bubble");

        } else if (this.isStar) {
            this.element.style.zIndex = "2003";
            this.inner.style.background = "url('image/star.png') no-repeat center";
            this.inner.style.backgroundSize = "contain";
            this.inner.style.opacity = "1";
            this.inner.style.border = "none";
            this.element.classList.add("star-bubble");

        } else if (this.isBad) {
            this.inner.classList.add("bad-bubble");

        } else {
            if (this.game.isStarActive) {

                this.inner.classList.add("star-mode");
            } else if (this.game.difficulty !== "training") {
                let hue;
                do {
                    hue = Math.random() * 360;
                } while (hue < 20 || hue > 340);

                this.inner.style.background = `hsl(${hue}, 100%, 50%)`;
            }
        }

        this.setupAnimation(size);
    }

    setupAnimation(size) {
    if (this.isSpecial) {

        const fromLeft = Math.random() < 0.5;

        this.element.style.top = Math.random() * (window.innerHeight - size) + "px";

        let duration = 8;
        this.element.style.animationDuration = duration + 's';

        if (fromLeft) {
            this.element.style.left = "-150px";
            this.element.style.animationName = "animHorizontal";
        } else {
            this.element.style.left = window.innerWidth + "px";
            this.element.style.animationName = "animHorizontalReverse";
        }

        this.element.style.animationTimingFunction = "linear";
        this.element.style.animationFillMode = "forwards";

        } else {
            const screenFactor = window.innerHeight / 800;
            let baseSpeed;

            if (this.game.isAimActive) {
                baseSpeed = AIM_SPEED;
            } else if (this.game.isSlowActive) {
                baseSpeed = this.game.baseSpawnSpeed * this.game.getSlowFactor();

            } else {
                baseSpeed = this.game.spawnSpeed;
            }

            let duration = Math.max(1.5, (baseSpeed / 1000) * 6 * screenFactor);
            if (this.isHeart && this.game.difficulty === "easy") {
                duration *= 1.4;
            }

            if (this.isStar) {
                if (this.game.difficulty === "easy") duration = 6;
                else if (this.game.difficulty === "hard") duration = 5;
                else if (this.game.difficulty === "expert") duration = 3;

            } else {
                if (this.game.difficulty === "expert") {
                    duration *= 0.8;
                }
            }

            if (this.game.difficulty === "training") {
                if (this.game.trainingDifficulty === "easy") {
                    duration = 4;
                } else if (this.game.trainingDifficulty === "medium") {
                    duration = 3.4;
                } else if (this.game.trainingDifficulty === "hard") {
                    duration = 3;
                }
            }

            this.element.style.setProperty('--bubble-duration', duration + 's');
            this.element.style.animationDuration = duration + 's';
            this.element.dataset.baseDuration = duration;

            this.element.style.animationName = "anim";
            this.element.style.animationTimingFunction = "linear";
        }
    }

    setupBehavior() {
        this.element.addEventListener("click", () => {
            if (this.game.isPaused) return;

            if (this.isHeart) return this.handleHeart();
            if (this.isSpecial) return this.handleSpecial();
            if (this.isBad) return this.handleBad();
            if (this.isSlow) return this.handleSlow();
            if (this.isStar) return this.handleStar();
            if (this.isAim) return this.handleAim();

            this.handleNormal();
        });
    }

    startLifetime() {
        this.remainingTime = this.isSpecial ? 15000 : 8000;
        this.startTime = Date.now();
        this.timeout = setTimeout(() => this.destroy(), this.remainingTime);
    }

    handleSlow() {
        play(sounds.powerup);

        ui.classList.remove("zoom-effect");
        void ui.offsetWidth;
        ui.classList.add("zoom-effect");

        setTimeout(() => {
            document.body.classList.remove("zoom-effect");
        }, 300);

        this.game.activateSlow();

        this.destroy();
    }

    handleHeart() {
        play(sounds.heart);

        if (this.game.lifes < 4) this.game.lifes++;

        this.game.updateMusic();
        this.game.displayLifes();
        this.inner.classList.add("heart-click");

        setTimeout(() => {
            this.destroy();
        }, 300);
    }

    handleSpecial() {
        play(sounds.success);

        this.game.increaseScore();
        this.clickCount++;

        this.element.style.filter = `brightness(${1 + this.clickCount * 0.11})`;

        this.inner.style.transform = "scale(1.2)";
        setTimeout(() => this.inner.style.transform = "scale(1)", 80);

        if (this.clickCount >= this.maxClicks) {
            this.destroy();
        }
    }

    handleStar() {
        play(sounds.clicStar);

        this.game.activateStar();

        const flash = document.getElementById("flashEffect");
        flash.classList.add("flash-active");

        setTimeout(() => {
            flash.classList.remove("flash-active");
        }, 300);

        document.body.classList.add("star-active");

        document.querySelectorAll('.bubble').forEach(b => {
            const instance = b.instance;
            if (instance === this) return;
            if (instance) instance.counted = true;
            b.remove();
        });

        this.destroy();

        this.game.lifes = 4;
        this.game.displayLifes();
    }

    handleAim() {
        play(sounds.soundAim);

        this.game.activateAim();

        this.destroy();
    }

    handleBad() {
        if (this.game.isGameOver) return;

        play(sounds.gameOver);

        this.inner.classList.add("bad-explosion");
        this.element.style.pointerEvents = "none";

        setTimeout(() => {

            this.element.remove();
            this.game.lifes = 0;
            this.game.displayLifes();

            this.game.gameOver();

        }, 250);
    }

    handleNormal() {
        if (this.game.difficulty === "training") {

            play(sounds.bubbleTraining);

            this.game.increaseScore();

            this.destroy();
            return;
        }

        if (this.game.isStarActive) {
            const s = sounds.star.cloneNode();
            s.volume = Math.min(1, sounds.star.volume * 50);
            s.play();

            this.game.score += 3;
            this.game.scoreDisplay.textContent = this.game.score;
        } else {
            play(sounds.bubble);
            this.game.increaseScore();
        }
        this.destroy();
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