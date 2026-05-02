Manic Miner clone that recreates only Central Cavern, preferably in JavaScript with HTML5 Canvas. Central Cavern is the first room of Manic Miner and includes the core mechanics of the full game: collectible items, a hostile moving enemy, static hazards, crumbling platforms, a conveyor, an exit portal, air depletion, and jump-based platforming.

Scope
Build only one playable room: Central Cavern. The player controls Miner Willy, starts in the bottom-left area of the map, must collect all flashing keys, avoid hazards and the Manic Mining Robot, then enter the exit portal to complete the level.

Do not build multi-room progression, level loading, music emulation, the complete Manic Miner room format, or later-room mechanics like switches and Eugene. The goal is a faithful, polished recreation of the first room’s movement, timing, and collision behavior in JavaScript.

Room model
The gameplay area for a Manic Miner room is 32 tiles wide by 16 tiles high, using 8×8 pixel tiles on the original Spectrum display, which corresponds to a 256×128 gameplay field with an 8-row HUD below it. For a modern JavaScript version, you should preserve the logical room size but scale rendering, for example with tileSize = 16 or 24, while keeping the room as a fixed single-screen playfield with no camera scrolling.

The room contains these tile categories:

Solid floor/wall.

Empty space.

Crumbling floor.

Conveyor floor.

Decorative but lethal static hazards such as poisonous plants.

Collectible keys/items.

Exit portal.

One horizontal moving enemy, the Manic Mining Robot.

A good level representation in JavaScript is a tile grid plus explicit object layers:

js
const TILE = {
  EMPTY: 0,
  SOLID: 1,
  CRUMBLE: 2,
  CONVEYOR: 3,
  HAZARD: 4
};
Then keep keys, portal, player spawn, and enemy as object instances rather than encoding all gameplay into tile values. That fits both the original room structure and modern maintainability.

JavaScript architecture
Use a single HTML page and Canvas renderer with a fixed update loop. Manic Miner is a physics platformer, so unlike Mazogs it should be simulated continuously rather than purely turn-based.

Recommended modules:

Game: high-level loop, state transitions, win/loss.

Level: tilemap, room objects, spawn points.

Player: movement, jumping, gravity, collision, death.

Enemy: horizontal robot movement and bounds.

Collectibles: keys and portal activation.

Renderer: tiles, sprites, HUD, animations.

Input: keyboard state.

Physics: tile collision and hazard resolution.

Recommended project structure:

text
manic-miner-central-cavern/
  index.html
  style.css
  src/
    main.js
    game.js
    level.js
    player.js
    enemy.js
    renderer.js
    input.js
    constants.js
This is enough for a clean browser implementation without overengineering.

Game loop
Use requestAnimationFrame for rendering and a fixed timestep for physics, such as 60 updates per second. The level’s difficulty depends heavily on timing, especially jumps over hazards, use of collapsing platforms, and the robot/conveyor timing on the right side of the room.

Suggested loop:

js
let accumulator = 0;
let lastTime = 0;
const step = 1000 / 60;

function frame(time) {
  const delta = Math.min(50, time - lastTime);
  lastTime = time;
  accumulator += delta;

  while (accumulator >= step) {
    game.update(step / 1000);
    accumulator -= step;
  }

  game.render();
  requestAnimationFrame(frame);
}
This gives deterministic movement and collision behavior, which matters for a game inspired by an 8-bit platformer built around repeatable timing.

Player movement
Miner Willy should feel committed and somewhat stiff by modern standards. Commentary on the game emphasizes that Willy cannot steer freely once airborne and that mistimed jumps are punished immediately, especially over hazards and the robot.

Implement:

Horizontal left/right ground movement.

Gravity.

Jump only when grounded.

Little or no air control after takeoff.

Tile-based floor and wall collision with sub-tile position tracking.

Death on contact with hazards or enemies.

Fall distance or landing severity can be ignored for a first implementation unless you want higher fidelity; at least some versions track “heavy falls,” but Central Cavern can be recreated convincingly without that system at first.

Suggested player state:

js
class Player {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.vx = 0;
    this.vy = 0;
    this.width = 14;
    this.height = 16;
    this.grounded = false;
    this.alive = true;
    this.facing = 1;
  }
}
Recommended movement rules:

Apply horizontal speed from input only if grounded, or with greatly reduced influence in air.

Apply gravity every frame.

If jump pressed while grounded, set upward velocity.

Resolve X and Y collisions separately against the tilemap.

This style produces the rigid jump arcs associated with Manic Miner.

Collision system
Use axis-aligned bounding boxes for the player and enemy, with collision against a tilemap. That is the simplest reliable model for a modern browser remake.

Collision categories:

Solid: blocks movement.

Crumbling: supports the player briefly, then disappears.

Conveyor: supports the player and pushes them horizontally.

Hazard: instant death on overlap.

Enemy: instant death on overlap.

Key: collected on overlap.

Portal: only usable when all keys are collected.

Pseudo-order for each update:

Read input.

Update player velocity.

Move player horizontally and resolve tile collisions.

Move player vertically and resolve tile collisions.

Determine supporting tile beneath player.

Apply conveyor effect if standing on conveyor.

Trigger crumble if standing on crumbling floor.

Update enemy.

Check overlap with hazards, enemy, keys, portal.

Decrease air and evaluate fail/win.

This order avoids many annoying edge cases.

Crumbling floors
Central Cavern includes dissolving or collapsing platforms, and this mechanic is one of the room’s signature lessons. The room-format documentation explains that crumbling floors in Manic Miner progressively shift downward and then convert to background once sufficiently eroded, which means the original mechanic is time-based per touched tile instance rather than globally toggled.

In a JavaScript recreation, give each crumbling tile instance its own state:

js
class CrumbleTileState {
  constructor() {
    this.active = false;
    this.timer = 0;
    this.gone = false;
  }
}
Behavior:

When the player first stands on a crumble tile, start its timer.

Keep it solid for a short delay, for example 0.25–0.5 seconds.

Then mark it gone and render it as empty.

Once gone, it remains gone for the rest of the attempt.

That captures the required feel even if you do not reproduce the exact original pixel-row crumble animation.

Conveyor
Central Cavern includes a conveyor on the right side of the room, and correct timing near it is part of the room’s challenge. The original room data separates conveyor behavior from block graphics, but for a single-room JavaScript clone you can simply define conveyor tiles as floor tiles that impart horizontal velocity while the player is grounded on them.

Implementation:

Conveyor tiles behave as solid floor.

If player is standing on conveyor, add conveyorSpeed to horizontal motion each frame.

Conveyor direction in Central Cavern should be fixed for the whole room, matching the original room’s behavior where a room’s conveyor direction is globally specified.

Pseudo-rule:

js
if (player.grounded && tileBelow === TILE.CONVEYOR) {
  player.x += conveyorSpeed * dt;
}
You may also want a simple visual animation, such as alternating stripe offsets every few frames, because the original conveyor is visually animated.

Static hazards
Central Cavern uses stationary lethal obstacles, usually represented as poisonous plants or pansies, which must be jumped over or avoided entirely. Treat these as non-solid lethal tiles or sprite hazards placed on top of floor geometry.

Rules:

The player can overlap their base floor tile but dies when the hitbox touches the hazard region.

Use slightly smaller hazard hitboxes than full-tile if needed for fairer play.

Do not make them stompable or destructible.

This is one of the main reasons jump commitment matters.

Keys and portal
The level requires the player to collect all keys before the portal becomes usable. Central Cavern is specifically designed to teach routing through awkward positions and jumps while collecting them.

Implement keys as objects, not tiles:

js
class KeyItem {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.collected = false;
  }
}
Rules:

On player overlap, mark key collected.

Track keysRemaining.

Portal is inactive while keysRemaining > 0.

When all keys are collected, animate or recolor the portal to indicate activation.

If player overlaps active portal, level is won.

The portal should exist in the room from the start, but it should only become an exit after all keys are collected.

Enemy: Manic Mining Robot
Central Cavern includes one horizontally moving enemy, usually referred to as the Manic Mining Robot in commentary. It patrols a fixed path and forces timed jumps, especially in combination with the conveyor and nearby hazard.

Implementation model:

js
class HorizontalEnemy {
  constructor(x, y, leftBound, rightBound, speed) {
    this.x = x;
    this.y = y;
    this.vx = speed;
    this.leftBound = leftBound;
    this.rightBound = rightBound;
    this.width = 16;
    this.height = 16;
  }

  update(dt) {
    this.x += this.vx * dt;
    if (this.x < this.leftBound) {
      this.x = this.leftBound;
      this.vx *= -1;
    }
    if (this.x > this.rightBound) {
      this.x = this.rightBound;
      this.vx *= -1;
    }
  }
}
Rules:

Move continuously.

Reverse at fixed bounds.

Kill player on overlap.

Do not allow bouncing on it.

Keep its speed constant and cycle deterministic, because Central Cavern relies on learnable timing windows.

For authenticity, make sure the robot’s path and speed create the familiar “wait a few frames, then jump” rhythm described in route commentary.

Air system
The room HUD includes an air bar, and the player loses if air runs out before reaching the portal. For a single-level clone, treat air as a countdown timer rather than trying to emulate all original scoring details immediately.

Implementation:

Start with a room timer, for example 100 units or a fixed number of seconds.

Reduce every frame.

Render as a horizontal bar in the HUD.

If air reaches zero before level completion, player dies or level fails.

This mechanic matters because it discourages waiting indefinitely for safe enemy cycles.

HUD
The original layout reserves eight tile rows below the gameplay field for status information such as level name, air supply, score, and lives. For a first-level-only clone, a simplified HUD is enough:

Level title: “Central Cavern”.

Air bar.

Keys remaining.

Lives optional.

Status text for win/lose.

If you want closer fidelity, keep the room at 32×16 logical tiles and draw the HUD in a separate strip below.

Rendering
Use Canvas 2D rendering with a retro-pixel aesthetic. Central Cavern is visually simple enough that you can use rectangles and minimalist sprites rather than full Spectrum asset extraction.

Recommended rendering layers:

Background color.

Static tilemap.

Crumble state overlays.

Keys and portal.

Enemy.

Player.

HUD.

To preserve retro clarity:

Use integer coordinates for rendering.

Disable image smoothing if using sprite sheets.

Use a fixed palette inspired by the Spectrum version.

Canvas setup:

js
const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');
ctx.imageSmoothingEnabled = false;
Level data format
Since you only need Central Cavern, use a hardcoded JSON-style object or string-array layout rather than implementing the original binary room format. The STOS reconstruction explicitly maps Central Cavern as a 32×16 logical room and treats keys and other objects separately during recreation.

Recommended format:

js
const levelData = {
  name: "Central Cavern",
  width: 32,
  height: 16,
  tiles: [
    "################################",
    "#..............................#",
    "#..............................#",
    "#..............................#",
    "#.........................^....#",
    "#==============================#",
    "#.............................k#",
    "#===...........................#",
    "#................##..^.........#",
    "#====....CCCCCCCCCCCCCCCCCC....#",
    "#............................==#",
    "#..............................#",
    "#...........^......####=======##",
    "#....================..........#",
    "#..............................#",
    "################################"
  ],
  playerSpawn: { x: 1, y: 14 },
  portal: { x: 30, y: 1 },
  keys: [
    { x: 9, y: 1 },
    { x: 11, y: 1 },
    { x: 16, y: 1 },
    { x: 24, y: 4 },
    { x: 21, y: 8 },
    { x: 12, y: 12 },
    { x: 30, y: 6 }
  ],
  enemy: {
    x: 25,
    y: 9,
    leftBound: 8,
    rightBound: 28,
    speed: 40
  }
};
The exact coordinates above are only an implementation template, not canonical data. The available sources confirm room dimensions and mechanics, but not a complete developer-ready coordinate list for every object in Central Cavern.

Physics tuning
For the game to feel right, tuning matters more than advanced architecture. Central Cavern is essentially a tutorial in exact jump spacing and timing.

Tune these constants carefully:

js
const PHYSICS = {
  gravity: 900,
  moveSpeed: 85,
  jumpSpeed: 280,
  conveyorSpeed: 35,
  crumbleDelay: 0.35,
  airDuration: 60
};
Important feel targets:

Willy should not accelerate too smoothly like a modern platformer.

Jumps should be predictable and repeatable.

Air control should be limited.

Hazard collisions should be unforgiving but not visibly unfair.

Conveyor should alter jump timing without making landing impossible.

State machine
Use a simple state machine:

text
BOOT
→ TITLE
→ PLAYING
→ DYING
→ GAME_OVER
→ LEVEL_COMPLETE
This is sufficient for a one-room game. During DYING, freeze control, play a short animation, then reset the room or reduce lives. During LEVEL_COMPLETE, show a completion banner and optionally restart.

Suggested update order
A practical per-frame update order is:

Read keyboard state.

Update player horizontal intent.

Apply gravity.

Move and resolve X collisions.

Move and resolve Y collisions.

Determine grounded state.

Apply conveyor if grounded on conveyor.

Trigger crumble timers if standing on crumble tile.

Update enemy patrol.

Check key collection.

Check hazard and enemy death.

Check portal activation and win.

Decrease air and fail if empty.

This ordering produces stable results.

Minimal class skeleton
A minimal class set in JavaScript could look like this:

js
class Game {
  constructor(levelData) {}
  resetLevel() {}
  update(dt) {}
  render() {}
}

class Level {
  constructor(data) {}
  getTile(tx, ty) {}
  isSolid(tx, ty) {}
  isHazard(tx, ty) {}
  isConveyor(tx, ty) {}
  isCrumble(tx, ty) {}
}

class Player {
  update(dt, input, level) {}
  kill() {}
  getBounds() {}
}

class HorizontalEnemy {
  update(dt) {}
  getBounds() {}
}

class Renderer {
  draw(game) {}
}
That is enough to get a maintainable implementation running quickly.

What to preserve faithfully
If the goal is “Manic Miner Central Cavern” rather than “generic retro platform level,” preserve these points:

Single-screen room, no scrolling.

Collect all keys before portal works.

Fixed jump arc with limited air steering.

One deterministic horizontal robot enemy.

Crumbling platforms that disappear after being stepped on.

Conveyor floor that shifts player timing.

Air countdown shown in HUD.

Instant death on hazard/enemy contact.

Practical build order
Build in this order for fastest progress:

Canvas and fixed room rendering.

Tilemap with solid collision.

Player run and jump.

Static hazards.

Keys and portal activation.

Horizontal robot patrol.

Crumbling platforms.

Conveyor behavior.

Air bar and state transitions.

Animation, polish, and tuning.

A good first milestone is: Willy can move, jump, collect all keys, and enter the portal in a rough Central Cavern layout. After that, add crumble timing and robot cycle tuning until the room becomes recognizable