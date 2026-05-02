// Tile types
const TILE = {
    EMPTY: 0,
    SOLID: 1,
    CRUMBLE: 2,
    CONVEYOR: 3,
    HAZARD: 4
};

// Physics constants
const PHYSICS = {
    gravity: 350,
    moveSpeed: 120,
    jumpSpeed: 280,
    conveyorSpeed: 35,
    crumbleDelay: 0.35,
    airDuration: 60,
    airWarningThreshold: 10
};

// Rendering
const TILE_SIZE = 24;
const ROOM_WIDTH = 32;
const ROOM_HEIGHT = 16;

// Game states
const STATE = {
    BOOT: 0,
    TITLE: 1,
    PLAYING: 2,
    DYING: 3,
    GAME_OVER: 4,
    LEVEL_COMPLETE: 5
};

// Colors (Spectrum-inspired palette)
const COLORS = {
    background: '#000000',
    solid: '#AAAAAA',
    crumble: '#8B4513',
    crumbleGone: '#000000',
    conveyor: '#0000FF',
    conveyorStripe: '#FFFFFF',
    hazard: '#00FF00',
    player: '#FFFFFF',
    playerEye: '#000000',
    enemy: '#FF0000',
    key: '#FFFF00',
    portal: '#FF00FF',
    portalActive: '#00FFFF',
    hudText: '#FFFFFF',
    airBar: '#00FF00',
    airBarWarning: '#FF0000'
};
