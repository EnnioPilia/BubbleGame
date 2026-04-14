import { sounds, play, pause } from "./sound.js";

export default class Bubble {
    constructor(game, forceSpecial = false, isHeart = false, isSlow = false) {
        this.game = game;
        this.isHeart = isHeart;
        this.isSpecial = forceSpecial;
        this.isSlow = isSlow;

        this.isBad = !this.isSpecial && !this.isHeart && !this.isSlow && Math.random() < 0.45;

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

        if (this.isSlow) {
            size = isMobile ? 90 : 160;
        }
        else if (this.isSpecial) {
            if (this.game.difficulty === "easy") {
                size = isMobile ? 120 : 180;
            } else {
                size = isMobile ? 80 : 110;
            }
        }
        else {
            size = Math.random() * (maxSize - minSize) + minSize;
        }
        if (this.isSlow) {
            this.inner.classList.add("slow-bubble");
        }

        this.element.style.width = size + "px";
        this.element.style.height = size + "px";
        this.element.style.top = window.innerHeight + "px";
        this.element.style.left = Math.random() * (window.innerWidth - size) + "px";

        if (this.isHeart) {
            this.inner.classList.add("heart");
            this.inner.innerHTML = "❤️";
        } else if (this.isSpecial) {
            this.inner.style.background = "radial-gradient(circle, violet, cyan)";
            this.inner.classList.add("special");

        } else if (this.isSlow) {

        } else if (this.isBad) {
            this.inner.classList.add("bad-bubble");
        } else {
            let hue;
            do {
                hue = Math.random() * 360;
            } while (hue < 20 || hue > 340);

            this.inner.style.background = `hsl(${hue}, 100%, 50%)`;
        }

        this.setupAnimation(size);
    }

    setupAnimation(size) {
        if (this.isSpecial) {
            this.element.style.top = Math.random() * (window.innerHeight - size) + "px";
            this.element.style.left = "-150px";

            let duration = 8;

            this.element.style.setProperty('--bubble-duration', duration + 's');
            this.element.style.animationDuration = duration + 's';

            this.element.style.animationName = "animHorizontal";
            this.element.style.animationTimingFunction = "linear";
            this.element.style.animationFillMode = "forwards";

        } else {
            const screenFactor = window.innerHeight / 800;
            let baseSpeed = this.game.isSlowActive
                ? this.game.baseSpawnSpeed * this.game.getSlowFactor()
                : this.game.spawnSpeed;

            let duration = Math.max(1.5, (baseSpeed / 1000) * 6 * screenFactor);

            if (this.isHeart && this.game.difficulty === "easy") {
                duration *= 1.4;
            }

            // 👉 ICI AUSSI
            this.element.style.setProperty('--bubble-duration', duration + 's');
            this.element.style.animationDuration = duration + 's';

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

        document.body.classList.add("zoom-effect");

        // setTimeout(() => {
        //     document.body.classList.remove("zoom-effect");
        // }, 300);

        this.game.activateSlow();

        this.destroy();
    }

    handleHeart() {
        play(sounds.heart);

        if (this.game.lifes < 4) this.game.lifes++;

        this.game.updateMusic();

        this.game.displayLifes();

        this.inner.style.transition = "transform 0.15s ease, opacity 0.15s ease";
        this.inner.style.transform = "scale(0.4)";
        this.inner.style.opacity = "0";

        setTimeout(() => this.destroy(), 150);
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

    handleBad() {
        play(sounds.error);

        this.destroy();

        this.game.lifes = 0;
        this.game.displayLifes();
        this.game.gameOver();
    }

    handleNormal() {
        play(sounds.bubble);

        this.game.increaseScore();
        this.destroy();
    }

    /* ================= LIFECYCLE ================= */

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