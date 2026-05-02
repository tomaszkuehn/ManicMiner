// Main entry point
window.addEventListener('load', () => {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;

    // Create game instance
    const game = new Game(levelData);
    const renderer = new Renderer(canvas);
    game.init(renderer);

    // Game loop with fixed timestep
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

    // Start the game loop
    requestAnimationFrame((time) => {
        lastTime = time;
        frame(time);
    });
});
