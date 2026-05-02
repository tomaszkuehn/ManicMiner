class Input {
    constructor() {
        this.keys = {};
        this.jumpPressed = false;

        window.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;
            if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') {
                this.jumpPressed = true;
                e.preventDefault();
            }
        });

        window.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
        });
    }

    isPressed(keyCode) {
        return !!this.keys[keyCode];
    }

    isJumpPressed() {
        const pressed = this.jumpPressed;
        this.jumpPressed = false;
        return pressed;
    }

    getHorizontalInput() {
        let input = 0;
        if (this.isPressed('ArrowLeft') || this.isPressed('KeyA')) input -= 1;
        if (this.isPressed('ArrowRight') || this.isPressed('KeyD')) input += 1;
        return input;
    }
}
