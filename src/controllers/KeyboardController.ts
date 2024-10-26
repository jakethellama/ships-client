import { KeyCommand } from "../classes/logic/KeyCommand";

export class KeyboardController {
    state;
    
    constructor() {
        this.state = {
            KeyA: { isPressed: false, firstDown: false, up: false },
            KeyD: { isPressed: false, firstDown: false, up: false },
            KeyW: { isPressed: false, firstDown: false, up: false },
            KeyS: { isPressed: false, firstDown: false, up: false },
            Space: { isPressed: false, firstDown: false, up: false },
        };

        window.addEventListener('keydown', (event) => { this.handleKeyDown(event); });
        window.addEventListener('keyup', (event) => { this.handleKeyUp(event); });
    }

    handleKeyDown(event: KeyboardEvent): void {
        const key = this.state[event.code as keyof typeof this.state];

        if (key && !key.isPressed) {
            key.isPressed = true;
            key.firstDown = true;
        }
    }

    handleKeyUp(event: KeyboardEvent): void {
        const key = this.state[event.code as keyof typeof this.state];

        if (key) {
            key.isPressed = false;
            key.up = true;
        }
    }
}
