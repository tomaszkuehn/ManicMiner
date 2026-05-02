class Level {
    constructor(data) {
        this.width = data.width;
        this.height = data.height;
        this.name = data.name;
        this.tiles = [];
        this.crumbleStates = {};
        this.keys = [];
        this.portal = null;
        this.playerSpawn = { x: 0, y: 0 };
        this.enemyData = null;

        this.parseTiles(data.tiles);
        this.initObjects(data);
        this.initCrumbleTiles(data.crumbleTiles || []);
        this.createWallGaps();
    }

    createWallGaps() {
        // Create gaps in left wall (x=0) at rows 2, 4, 6, 8, 10, 12 to allow climbing
        var gapRows = [];
        for (var i = 0; i < gapRows.length; i++) {
            var y = gapRows[i];
            if (y < this.height) {
                this.tiles[y][0] = TILE.EMPTY; // Gap in left wall
            }
        }
    }

    parseTiles(tileStrings) {
        for (let y = 0; y < this.height; y++) {
            this.tiles[y] = [];
            for (let x = 0; x < this.width; x++) {
                const char = tileStrings[y][x];
                switch (char) {
                    case '#': this.tiles[y][x] = TILE.SOLID; break;
                    case '=': this.tiles[y][x] = TILE.SOLID; break;
                    case 'C': this.tiles[y][x] = TILE.CONVEYOR; break;
                    case '^': this.tiles[y][x] = TILE.HAZARD; break;
                    case 'k': this.tiles[y][x] = TILE.EMPTY; break;
                    default: this.tiles[y][x] = TILE.EMPTY; break;
                }
            }
        }
    }

    initObjects(data) {
        this.playerSpawn = { ...data.playerSpawn };
        this.portal = { ...data.portal, active: false };
        this.keys = data.keys.map(k => ({ ...k, collected: false }));
        this.enemyData = { ...data.enemy };
    }

    initCrumbleTiles(crumbleTiles) {
        for (const ct of crumbleTiles) {
            this.tiles[ct.y][ct.x] = TILE.CRUMBLE;
        }
    }

    getTile(tx, ty) {
        if (tx < 0 || tx >= this.width || ty < 0 || ty >= this.height) return TILE.SOLID;
        return this.tiles[ty][tx];
    }

    isSolid(tx, ty) {
        if (tx < 0 || tx >= this.width || ty < 0 || ty >= this.height) return true;
        const tile = this.tiles[ty][tx];
        return tile === TILE.SOLID || tile === TILE.CONVEYOR;
    }

    isCrumble(tx, ty) {
        if (tx < 0 || tx >= this.width || ty < 0 || ty >= this.height) return false;
        return this.tiles[ty][tx] === TILE.CRUMBLE;
    }

    isHazard(tx, ty) {
        if (tx < 0 || tx >= this.width || ty < 0 || ty >= this.height) return false;
        return this.tiles[ty][tx] === TILE.HAZARD;
    }

    isConveyor(tx, ty) {
        if (tx < 0 || tx >= this.width || ty < 0 || ty >= this.height) return false;
        return this.tiles[ty][tx] === TILE.CONVEYOR;
    }

    getCrumbleState(tx, ty) {
        const key = `${tx},${ty}`;
        if (!this.crumbleStates[key]) {
            this.crumbleStates[key] = { active: false, timer: 0, gone: false };
        }
        return this.crumbleStates[key];
    }

    updateCrumble(dt) {
        for (const key in this.crumbleStates) {
            const state = this.crumbleStates[key];
            if (state.active && !state.gone) {
                state.timer += dt;
                if (state.timer >= PHYSICS.crumbleDelay) {
                    state.gone = true;
                    const [tx, ty] = key.split(',').map(Number);
                    this.tiles[ty][tx] = TILE.EMPTY;
                }
            }
        }
    }

    activateCrumble(tx, ty) {
        const state = this.getCrumbleState(tx, ty);
        if (!state.gone) {
            state.active = true;
        }
    }

    collectKey(px, py, pw, ph) {
        for (const key of this.keys) {
            if (!key.collected) {
                const kx = key.x * TILE_SIZE;
                const ky = key.y * TILE_SIZE;
                if (px < kx + TILE_SIZE && px + pw > kx &&
                    py < ky + TILE_SIZE && py + ph > ky) {
                    key.collected = true;
                    return true;
                }
            }
        }
        return false;
    }

    getKeysRemaining() {
        return this.keys.filter(k => !k.collected).length;
    }

    checkPortal(px, py, pw, ph) {
        const portalX = this.portal.x * TILE_SIZE;
        const portalY = this.portal.y * TILE_SIZE;
        return px < portalX + TILE_SIZE && px + pw > portalX &&
               py < portalY + TILE_SIZE && py + ph > portalY;
    }

    isPortalActive() {
        return this.getKeysRemaining() === 0;
    }
}

// Central Cavern level data (accessible layout with platforms and wall gaps)
const levelData = {
    name: "Central Cavern",
    width: 32,
    height: 16,
    tiles: [
        "################################",
        "#k....k....k...................#",
        "#..............................#",
        "#..............................#",
        "#.....=..==....................#",
        "#............==================#",
        "#======........................#",
        "#k.............................#",
        "#............##..^.............#",
        "#====....CCCCCCCCCCCCCCCCCC....#",
        "#............................==#",
        "#..............................#",
        "#......^..............=======..#",
        "#....================..........#",
        "#..............................#",
        "################################"
    ],
    playerSpawn: { x: 1, y: 14 },
    portal: { x: 30, y: 1 },
    keys: [
        { x: 1, y: 1 },
        { x: 6, y: 1 },
        { x: 11, y: 1 },
        { x: 29, y: 7 },
        { x: 21, y: 8 },
        { x: 12, y: 12 },
        { x: 5, y: 12 }
    ],
    crumbleTiles: [
        { x: 12, y: 8 },
        { x: 13, y: 8 },
        { x: 14, y: 8 }
    ],
    enemy: {
        x: 25,
        y: 9,
        leftBound: 9,
        rightBound: 28,
        speed: 40
    }
};
