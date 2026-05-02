class Renderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.ctx.imageSmoothingEnabled = false;
        this.conveyorOffset = 0;
        this.conveyorTimer = 0;

        // Pixel art sprite definitions (each number represents a pixel color index)
        this.sprites = {
            // Miner Willy sprites (18x20) - 2 frames for walking
            player: [
                // Frame 0: Standing/Walking frame 1
                [
                    [0,0,0,0,0,0,1,1,1,1,0,0,0,0,0,0,0,0],
                    [0,0,0,0,0,1,1,1,1,1,1,0,0,0,0,0,0,0],
                    [0,0,0,0,1,1,1,1,1,1,1,1,0,0,0,0,0,0],
                    [0,0,0,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0],
                    [0,0,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0],
                    [0,0,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0],
                    [0,0,0,0,1,1,1,1,1,1,1,1,0,0,0,0,0,0],
                    [0,0,0,0,1,1,1,1,1,1,1,1,0,0,0,0,0,0],
                    [0,0,0,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0],
                    [0,0,0,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0],
                    [0,0,0,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0],
                    [0,0,0,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0],
                    [0,0,0,1,1,1,1,0,0,0,0,1,1,1,0,0,0,0],
                    [0,0,0,1,1,1,1,0,0,0,0,1,1,1,0,0,0,0],
                    [0,0,0,0,1,1,1,1,1,1,1,1,0,0,0,0,0,0],
                    [0,0,0,0,1,1,1,1,1,1,1,1,0,0,0,0,0,0],
                    [0,0,0,0,0,1,1,1,1,1,1,0,0,0,0,0,0,0],
                    [0,0,0,0,0,1,1,1,1,1,1,0,0,0,0,0,0,0],
                    [0,0,0,0,0,0,1,1,1,1,0,0,0,0,0,0,0,0],
                    [0,0,0,0,0,0,1,1,1,1,0,0,0,0,0,0,0,0]
                ],
                // Frame 1: Walking frame 2
                [
                    [0,0,0,0,0,0,1,1,1,1,0,0,0,0,0,0,0,0],
                    [0,0,0,0,0,1,1,1,1,1,1,0,0,0,0,0,0,0],
                    [0,0,0,0,1,1,1,1,1,1,1,1,0,0,0,0,0,0],
                    [0,0,0,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0],
                    [0,0,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0],
                    [0,0,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0],
                    [0,0,0,0,1,1,1,1,1,1,1,1,0,0,0,0,0,0],
                    [0,0,0,0,1,1,1,1,1,1,1,1,0,0,0,0,0,0],
                    [0,0,0,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0],
                    [0,0,0,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0],
                    [0,0,0,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0],
                    [0,0,0,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0],
                    [0,0,1,1,1,1,0,0,0,0,0,1,1,1,0,0,0,0],
                    [0,0,0,1,1,1,1,0,0,0,1,1,1,0,0,0,0,0],
                    [0,0,0,0,1,1,1,1,1,1,1,1,0,0,0,0,0,0],
                    [0,0,0,0,1,1,1,1,1,1,1,1,0,0,0,0,0,0],
                    [0,0,0,0,0,1,1,1,1,1,1,0,0,0,0,0,0,0],
                    [0,0,0,0,0,1,1,1,1,1,1,0,0,0,0,0,0,0],
                    [0,0,0,0,0,0,1,1,1,1,0,0,0,0,0,0,0,0],
                    [0,0,0,0,0,0,1,1,1,1,0,0,0,0,0,0,0,0]
                ]
            ],
            // Enemy: Manic Mining Robot (16x16)
            enemy: [
                [
                    [0,0,0,0,2,2,2,2,2,2,2,2,0,0,0,0],
                    [0,0,0,2,2,2,2,2,2,2,2,2,2,0,0,0],
                    [0,0,2,2,3,3,2,2,2,2,3,3,2,2,0,0],
                    [0,0,2,2,3,3,2,2,2,2,3,3,2,2,0,0],
                    [0,0,2,2,2,2,2,2,2,2,2,2,2,2,0,0],
                    [0,0,2,2,2,2,2,2,2,2,2,2,2,2,0,0],
                    [0,0,0,2,2,2,2,2,2,2,2,2,2,0,0,0],
                    [0,0,0,2,2,2,2,2,2,2,2,2,2,0,0,0],
                    [0,0,2,2,2,2,2,2,2,2,2,2,2,2,0,0],
                    [0,0,2,2,2,2,2,2,2,2,2,2,2,2,0,0],
                    [0,0,2,2,2,2,2,2,2,2,2,2,2,2,0,0],
                    [0,0,2,2,2,2,2,2,2,2,2,2,2,2,0,0],
                    [0,0,0,2,2,0,0,2,2,0,0,2,2,0,0,0],
                    [0,0,0,2,2,0,0,2,2,0,0,2,2,0,0,0],
                    [0,0,0,0,2,2,2,2,2,2,2,2,0,0,0,0],
                    [0,0,0,0,2,2,2,2,2,2,2,2,0,0,0,0]
                ]
            ],
            // Key (8x8)
            key: [
                [
                    [0,0,0,0,0,0,0,0],
                    [0,0,0,1,1,0,0,0],
                    [0,0,1,1,1,1,0,0],
                    [0,1,1,1,1,1,1,0],
                    [0,1,1,1,1,1,1,0],
                    [0,0,1,1,1,1,0,0],
                    [0,0,0,1,1,0,0,0],
                    [0,0,0,0,0,0,0,0]
                ]
            ],
            // Hazard: Poisonous plant (8x8)
            hazard: [
                [
                    [0,0,0,2,2,0,0,0],
                    [0,0,2,2,2,2,0,0],
                    [0,2,2,3,3,2,2,0],
                    [0,2,3,3,3,3,2,0],
                    [0,2,3,3,3,3,2,0],
                    [0,0,2,2,2,2,0,0],
                    [0,0,0,2,2,0,0,0],
                    [0,0,0,0,0,0,0,0]
                ]
            ]
        };

        // Color palette for sprites
        this.palette = {
            0: null,        // Transparent
            1: '#FFFFFF',   // White (Willy's body)
            2: '#FF0000',   // Red (Robot body)
            3: '#AA0000',   // Dark red (Robot details)
            4: '#FFFF00',   // Yellow (Key)
            5: '#00FF00',   // Green (Hazard)
            6: '#008800'    // Dark green (Hazard details)
        };
    }

    clear() {
        this.ctx.fillStyle = COLORS.background;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    drawLevel(level) {
        for (let y = 0; y < level.height; y++) {
            for (let x = 0; x < level.width; x++) {
                const tile = level.tiles[y][x];
                const px = x * TILE_SIZE;
                const py = y * TILE_SIZE;

                switch (tile) {
                    case TILE.SOLID:
                        this.drawSolidTile(px, py);
                        break;
                    case TILE.CRUMBLE:
                        // Check if this crumble tile is gone
                        const state = level.getCrumbleState(x, y);
                        if (!state.gone) {
                            this.drawCrumbleTile(px, py, state);
                        }
                        break;
                    case TILE.CONVEYOR:
                        this.drawConveyor(px, py);
                        break;
                    case TILE.HAZARD:
                        this.drawHazard(px, py);
                        break;
                }
            }
        }
    }

    drawSolidTile(x, y) {
        // Pixel art solid tile with checkerboard pattern
        const pixelSize = TILE_SIZE / 8;
        for (let py = 0; py < 8; py++) {
            for (let px = 0; px < 8; px++) {
                // Create a stone-like pattern
                const isLight = (px + py) % 2 === 0;
                this.ctx.fillStyle = isLight ? '#CCCCCC' : COLORS.solid;
                this.ctx.fillRect(x + px * pixelSize, y + py * pixelSize, pixelSize, pixelSize);
            }
        }
    }

    drawCrumbleTile(x, y, state) {
        // Crumbling floor tile
        const pixelSize = TILE_SIZE / 8;
        for (let py = 0; py < 8; py++) {
            for (let px = 0; px < 8; px++) {
                if (state.active) {
                    // Show cracks when crumbling
                    const crack = Math.sin((px + py + state.timer * 10)) > 0.5;
                    this.ctx.fillStyle = crack ? '#5C2E00' : COLORS.crumble;
                } else {
                    const isLight = (px + py) % 2 === 0;
                    this.ctx.fillStyle = isLight ? '#A0522D' : COLORS.crumble;
                }
                this.ctx.fillRect(x + px * pixelSize, y + py * pixelSize, pixelSize, pixelSize);
            }
        }
    }

    drawConveyor(x, y) {
        // Pixel art conveyor with animated stripes
        const pixelSize = TILE_SIZE / 8;
        const offset = Math.floor(this.conveyorOffset) % 4;
        
        for (let py = 0; py < 8; py++) {
            for (let px = 0; px < 8; px++) {
                // Blue base with white stripes
                if ((px + offset) % 4 === 0 || (px + offset) % 4 === 1) {
                    this.ctx.fillStyle = COLORS.conveyorStripe;
                } else {
                    this.ctx.fillStyle = COLORS.conveyor;
                }
                this.ctx.fillRect(x + px * pixelSize, y + py * pixelSize, pixelSize, pixelSize);
            }
        }
    }

    updateConveyor(dt) {
        this.conveyorTimer += dt;
        if (this.conveyorTimer > 0.1) {
            this.conveyorOffset += 1;
            this.conveyorTimer = 0;
        }
    }

    drawHazard(x, y) {
        // Draw pixel art hazard (poisonous plant)
        const sprite = this.sprites.hazard[0];
        const pixelSize = TILE_SIZE / 8;
        for (let py = 0; py < 8; py++) {
            for (let px = 0; px < 8; px++) {
                const colorIdx = sprite[py][px];
                if (colorIdx !== 0 && this.palette[colorIdx]) {
                    this.ctx.fillStyle = this.palette[colorIdx];
                    this.ctx.fillRect(x + px * pixelSize, y + py * pixelSize, pixelSize, pixelSize);
                }
            }
        }
    }

    drawKeys(level) {
        const sprite = this.sprites.key[0];
        const pixelSize = TILE_SIZE / 8;
        const flash = Math.sin(Date.now() / 200) > 0;
        
        for (const key of level.keys) {
            if (!key.collected) {
                const kx = key.x * TILE_SIZE;
                const ky = key.y * TILE_SIZE;
                
                // Draw pixel art key with flashing effect
                for (let py = 0; py < 8; py++) {
                    for (let px = 0; px < 8; px++) {
                        const colorIdx = sprite[py][px];
                        if (colorIdx !== 0) {
                            this.ctx.fillStyle = flash ? COLORS.key : '#888800';
                            this.ctx.fillRect(kx + px * pixelSize, ky + py * pixelSize, pixelSize, pixelSize);
                        }
                    }
                }
            }
        }
    }

    drawPortal(level) {
        const portalX = level.portal.x * TILE_SIZE;
        const portalY = level.portal.y * TILE_SIZE;
        const active = level.isPortalActive();

        // Pixel art portal (8x8)
        const pixelSize = TILE_SIZE / 8;
        const pulse = Math.sin(Date.now() / 300) > 0;

        for (let py = 0; py < 8; py++) {
            for (let px = 0; px < 8; px++) {
                // Create a portal shape
                const cx = px - 3.5;
                const cy = py - 3.5;
                const dist = Math.sqrt(cx * cx + cy * cy);

                if (dist < 4) {
                    if (dist < 2) {
                        // Inner part
                        this.ctx.fillStyle = active ? '#FFFFFF' : '#880088';
                    } else {
                        // Outer ring
                        this.ctx.fillStyle = active ? COLORS.portalActive : COLORS.portal;
                    }
                    this.ctx.fillRect(portalX + px * pixelSize, portalY + py * pixelSize, pixelSize, pixelSize);
                }

                // Add sparkle effect when active
                if (active && pulse && dist > 2 && dist < 3.5 && (px + py) % 2 === 0) {
                    this.ctx.fillStyle = '#FFFFFF';
                    this.ctx.fillRect(portalX + px * pixelSize, portalY + py * pixelSize, pixelSize, pixelSize);
                }
            }
        }
    }

    drawPlayer(player) {
        if (!player.alive && player.deathTimer > 0.5) return;

        const px = Math.floor(player.x);
        const py = Math.floor(player.y);

        if (player.alive) {
            // Select animation frame based on movement
            const frameIdx = (player.grounded && Math.abs(player.vx) > 10) ? player.animFrame % 2 : 0;
            const sprite = this.sprites.player[frameIdx];
            const pixelSize = player.width / 18; // 18 pixels wide
            
            // Draw pixel art player
            for (let py2 = 0; py2 < 20; py2++) {
                for (let px2 = 0; px2 < 18; px2++) {
                    const colorIdx = sprite[py2][px2];
                    if (colorIdx !== 0 && this.palette[colorIdx]) {
                        this.ctx.fillStyle = this.palette[colorIdx];
                        let drawX = px + px2 * pixelSize;
                        // Flip sprite based on facing direction
                        if (player.facing < 0) {
                            drawX = px + (17 - px2) * pixelSize;
                        }
                        this.ctx.fillRect(drawX, py + py2 * pixelSize, pixelSize, pixelSize);
                    }
                }
            }
        } else {
            // Death animation - flashing X
            const flash = Math.sin(Date.now() / 100) > 0;
            if (flash) {
                this.ctx.fillStyle = COLORS.player;
                this.ctx.fillRect(px + 2, py + 2, 2, player.height - 4);
                this.ctx.fillRect(px + player.width - 4, py + 2, 2, player.height - 4);
                this.ctx.fillRect(px + 2, py + player.height - 4, player.width - 4, 2);
                this.ctx.fillRect(px + 2, py + 2, player.width - 4, 2);
            }
        }
    }

    drawEnemy(enemy) {
        const ex = Math.floor(enemy.x);
        const ey = Math.floor(enemy.y);

        // Draw pixel art enemy (Manic Mining Robot)
        const sprite = this.sprites.enemy[0];
        const pixelSize = enemy.width / 16;
        
        for (let py = 0; py < 16; py++) {
            for (let px = 0; px < 16; px++) {
                const colorIdx = sprite[py][px];
                if (colorIdx !== 0 && this.palette[colorIdx]) {
                    this.ctx.fillStyle = this.palette[colorIdx];
                    this.ctx.fillRect(ex + px * pixelSize, ey + py * pixelSize, pixelSize, pixelSize);
                }
            }
        }
    }

    drawHUD(game) {
        const hudY = ROOM_HEIGHT * TILE_SIZE + 10;
        this.ctx.fillStyle = COLORS.hudText;
        this.ctx.font = '14px "Courier New", monospace';

        // Level name
        this.ctx.fillText(game.level.name, 10, hudY);

        // Keys remaining
        const keysRemaining = game.level.getKeysRemaining();
        this.ctx.fillText(`Keys: ${keysRemaining}`, 200, hudY);

        // Air bar
        const airPercent = Math.max(0, game.player.air / PHYSICS.airDuration);
        const barWidth = 150;
        const barHeight = 12;
        const barX = 350;
        const barY = hudY - 10;

        this.ctx.fillStyle = '#333';
        this.ctx.fillRect(barX, barY, barWidth, barHeight);

        this.ctx.fillStyle = airPercent < 0.2 ? COLORS.airBarWarning : COLORS.airBar;
        this.ctx.fillRect(barX, barY, barWidth * airPercent, barHeight);

        this.ctx.fillStyle = COLORS.hudText;
        this.ctx.fillText('Air', barX - 35, barY + 10);

        // Status message
        if (game.state === STATE.LEVEL_COMPLETE) {
            this.ctx.fillStyle = '#00FF00';
            this.ctx.font = '24px "Courier New", monospace';
            this.ctx.fillText('LEVEL COMPLETE!', 250, 200);
        } else if (game.state === STATE.GAME_OVER) {
            this.ctx.fillStyle = '#FF0000';
            this.ctx.font = '24px "Courier New", monospace';
            this.ctx.fillText('GAME OVER', 280, 200);
        }
    }
}
