class HorizontalEnemy {
    constructor(x, y, leftBound, rightBound, speed) {
        this.x = x * TILE_SIZE;
        this.y = y * TILE_SIZE;
        this.vx = speed;
        this.leftBound = leftBound * TILE_SIZE;
        this.rightBound = rightBound * TILE_SIZE;
        this.width = TILE_SIZE;
        this.height = TILE_SIZE;
        this.animFrame = 0;
        this.animTimer = 0;
    }

    update(dt) {
        this.x += this.vx * dt;

        if (this.x < this.leftBound) {
            this.x = this.leftBound;
            this.vx *= -1;
        }
        if (this.x > this.rightBound - this.width) {
            this.x = this.rightBound - this.width;
            this.vx *= -1;
        }

        // Animation
        this.animTimer += dt;
        if (this.animTimer > 0.2) {
            this.animFrame = (this.animFrame + 1) % 2;
            this.animTimer = 0;
        }
    }

    getBounds() {
        return {
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height
        };
    }
}
