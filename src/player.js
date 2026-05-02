class Player {
    constructor(x, y) {
        this.x = x * TILE_SIZE;
        this.y = y * TILE_SIZE;
        this.vx = 0;
        this.vy = 0;
        this.width = 18;
        this.height = 20;
        this.grounded = false;
        this.alive = true;
        this.facing = 1;
        this.air = PHYSICS.airDuration;
        this.deathTimer = 0;
        this.animFrame = 0;
        this.animTimer = 0;
    }

    update(dt, input, level) {
        if (!this.alive) {
            this.deathTimer += dt;
            return;
        }

        // Horizontal input (only effective when grounded)
        const hInput = input.getHorizontalInput();
        if (this.grounded) {
            this.vx = hInput * PHYSICS.moveSpeed;
        } else {
            // Limited air control - more responsive
            this.vx += hInput * PHYSICS.moveSpeed * 0.5 * dt;
            this.vx *= 0.98; // Less air resistance
        }

        if (hInput !== 0) this.facing = hInput;

        // Jump
        if (input.isJumpPressed() && this.grounded) {
            this.vy = -PHYSICS.jumpSpeed;
            this.grounded = false;
        }

        // Gravity
        this.vy += PHYSICS.gravity * dt;

        // Move horizontally and resolve collisions
        this.x += this.vx * dt;
        this.resolveXCollision(level);

        // Move vertically and resolve collisions
        this.y += this.vy * dt;
        this.resolveYCollision(level);

        // Check grounded state
        this.checkGrounded(level);

        // Apply conveyor if grounded
        if (this.grounded) {
            const tx = Math.floor((this.x + this.width / 2) / TILE_SIZE);
            const ty = Math.floor((this.y + this.height) / TILE_SIZE);
            if (level.isConveyor(tx, ty)) {
                this.x += PHYSICS.conveyorSpeed * dt;
                this.resolveXCollision(level);
            }
        }

        // Check crumbling platforms
        if (this.grounded) {
            const tx = Math.floor((this.x + this.width / 2) / TILE_SIZE);
            const ty = Math.floor((this.y + this.height) / TILE_SIZE);
            if (level.isCrumble(tx, ty)) {
                level.activateCrumble(tx, ty);
            }
        }

        // Collect keys
        level.collectKey(this.x, this.y, this.width, this.height);

        // Update air
        this.air -= dt;
        if (this.air <= 0) {
            this.alive = false;
        }

        // Animation
        this.animTimer += dt;
        if (this.animTimer > 0.15) {
            this.animFrame = (this.animFrame + 1) % 4;
            this.animTimer = 0;
        }
    }

    resolveXCollision(level) {
        const left = Math.floor(this.x / TILE_SIZE);
        const right = Math.floor((this.x + this.width - 1) / TILE_SIZE);
        const top = Math.floor(this.y / TILE_SIZE);
        const bottom = Math.floor((this.y + this.height - 1) / TILE_SIZE);

        if (this.vx > 0) {
            // Moving right
            for (let ty = top; ty <= bottom; ty++) {
                if (level.isSolid(right, ty)) {
                    this.x = right * TILE_SIZE - this.width;
                    this.vx = 0;
                    break;
                }
            }
        } else if (this.vx < 0) {
            // Moving left
            for (let ty = top; ty <= bottom; ty++) {
                if (level.isSolid(left, ty)) {
                    this.x = (left + 1) * TILE_SIZE;
                    this.vx = 0;
                    break;
                }
            }
        }
    }

    resolveYCollision(level) {
        const left = Math.floor(this.x / TILE_SIZE);
        const right = Math.floor((this.x + this.width - 1) / TILE_SIZE);
        const top = Math.floor(this.y / TILE_SIZE);
        const bottom = Math.floor((this.y + this.height - 1) / TILE_SIZE);

        if (this.vy > 0) {
            // Moving down
            for (let tx = left; tx <= right; tx++) {
                if (level.isSolid(tx, bottom)) {
                    this.y = bottom * TILE_SIZE - this.height;
                    this.vy = 0;
                    this.grounded = true;
                    break;
                }
            }
        } else if (this.vy < 0) {
            // Moving up
            for (let tx = left; tx <= right; tx++) {
                if (level.isSolid(tx, top)) {
                    this.y = (top + 1) * TILE_SIZE;
                    this.vy = 0;
                    break;
                }
            }
        }
    }

    checkGrounded(level) {
        const tx = Math.floor((this.x + this.width / 2) / TILE_SIZE);
        const ty = Math.floor((this.y + this.height) / TILE_SIZE);
        this.grounded = level.isSolid(tx, ty) || level.isCrumble(tx, ty);
    }

    kill() {
        this.alive = false;
        this.deathTimer = 0;
    }

    getBounds() {
        return {
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height
        };
    }

    checkHazardCollision(level) {
        const left = Math.floor(this.x / TILE_SIZE);
        const right = Math.floor((this.x + this.width - 1) / TILE_SIZE);
        const top = Math.floor(this.y / TILE_SIZE);
        const bottom = Math.floor((this.y + this.height - 1) / TILE_SIZE);

        for (let tx = left; tx <= right; tx++) {
            for (let ty = top; ty <= bottom; ty++) {
                if (level.isHazard(tx, ty)) {
                    return true;
                }
            }
        }
        return false;
    }
}
