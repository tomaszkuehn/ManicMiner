class Game {
    constructor(levelData) {
        this.state = STATE.TITLE;
        this.level = new Level(levelData);
        this.player = new Player(this.level.playerSpawn.x, this.level.playerSpawn.y);
        this.enemy = new HorizontalEnemy(
            this.level.enemyData.x,
            this.level.enemyData.y,
            this.level.enemyData.leftBound,
            this.level.enemyData.rightBound,
            this.level.enemyData.speed
        );
        this.input = new Input();
        this.renderer = null;
        this.deathTimer = 0;
        this.completeTimer = 0;
    }

    init(renderer) {
        this.renderer = renderer;
    }

    resetLevel() {
        this.level = new Level(levelData);
        this.player = new Player(this.level.playerSpawn.x, this.level.playerSpawn.y);
        this.enemy = new HorizontalEnemy(
            this.level.enemyData.x,
            this.level.enemyData.y,
            this.level.enemyData.leftBound,
            this.level.enemyData.rightBound,
            this.level.enemyData.speed
        );
        this.state = STATE.PLAYING;
        this.deathTimer = 0;
        this.completeTimer = 0;
    }

    update(dt) {
        switch (this.state) {
            case STATE.TITLE:
                if (this.input.isJumpPressed() || this.input.keys['Enter']) {
                    this.state = STATE.PLAYING;
                }
                break;

            case STATE.PLAYING:
                this.updatePlaying(dt);
                break;

            case STATE.DYING:
                this.updateDying(dt);
                break;

            case STATE.GAME_OVER:
                if (this.input.isJumpPressed() || this.input.keys['Enter']) {
                    this.resetLevel();
                }
                break;

            case STATE.LEVEL_COMPLETE:
                this.updateComplete(dt);
                break;
        }
    }

    updatePlaying(dt) {
        // Update player
        this.player.update(dt, this.input, this.level);

        // Update enemy
        this.enemy.update(dt);

        // Update crumble states
        this.level.updateCrumble(dt);

        // Check hazard collision
        if (this.player.alive && this.player.checkHazardCollision(this.level)) {
            this.player.kill();
            this.state = STATE.DYING;
            this.deathTimer = 0;
        }

        // Check enemy collision
        if (this.player.alive) {
            const playerBounds = this.player.getBounds();
            const enemyBounds = this.enemy.getBounds();
            if (this.checkCollision(playerBounds, enemyBounds)) {
                this.player.kill();
                this.state = STATE.DYING;
                this.deathTimer = 0;
            }
        }

        // Check portal
        if (this.player.alive && this.level.isPortalActive()) {
            if (this.level.checkPortal(this.player.x, this.player.y, this.player.width, this.player.height)) {
                this.state = STATE.LEVEL_COMPLETE;
                this.completeTimer = 0;
            }
        }

        // Check air
        if (this.player.alive && this.player.air <= 0) {
            this.player.kill();
            this.state = STATE.DYING;
            this.deathTimer = 0;
        }

        // Check if player fell off screen
        if (this.player.y > ROOM_HEIGHT * TILE_SIZE + 50) {
            this.player.kill();
            this.state = STATE.DYING;
            this.deathTimer = 0;
        }
    }

    updateDying(dt) {
        this.deathTimer += dt;
        if (this.deathTimer > 1.5) {
            this.state = STATE.GAME_OVER;
        }
    }

    updateComplete(dt) {
        this.completeTimer += dt;
        if (this.completeTimer > 3) {
            // In a full game, would load next level
            // For now, just show completion
        }
    }

    checkCollision(a, b) {
        return a.x < b.x + b.width &&
               a.x + a.width > b.x &&
               a.y < b.y + b.height &&
               a.y + a.height > b.y;
    }

    render() {
        if (!this.renderer) return;

        this.renderer.clear();
        this.renderer.updateConveyor(1 / 60);

        switch (this.state) {
            case STATE.TITLE:
                this.renderTitle();
                break;

            case STATE.PLAYING:
            case STATE.DYING:
            case STATE.GAME_OVER:
            case STATE.LEVEL_COMPLETE:
                this.renderGame();
                break;
        }
    }

    renderTitle() {
        const ctx = this.renderer.ctx;
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '32px "Courier New", monospace';
        ctx.fillText('MANIC MINER', 200, 150);
        ctx.font = '16px "Courier New", monospace';
        ctx.fillText('Central Cavern', 260, 190);
        ctx.fillText('Press SPACE or ENTER to start', 220, 250);
        ctx.fillText('Arrow Keys / WASD to move', 225, 280);
        ctx.fillText('Space to jump', 265, 300);
    }

    renderGame() {
        this.renderer.drawLevel(this.level);
        this.renderer.drawKeys(this.level);
        this.renderer.drawPortal(this.level);
        this.renderer.drawEnemy(this.enemy);
        this.renderer.drawPlayer(this.player);
        this.renderer.drawHUD(this);
    }
}
