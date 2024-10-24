const keyToInputMap = {
    KeyA: 'left',
    KeyD: 'right',
    KeyW: 'forward',
    KeyS: 'brake',
    Space: 'fire',
};

export class KeyboardController {
    state;
    
    constructor() {
        this.state = {
            left: { pressed: false },
            right: { pressed: false },
            forward: { pressed: false },
            brake: { pressed: false },
            fire: { pressed: false },

        };

        window.addEventListener('keydown', (event) => { this.handleKeyDown(event); });
        window.addEventListener('keyup', (event) => { this.handleKeyUp(event); });
    }

    handleKeyDown(event: KeyboardEvent): void {
        const input: string = keyToInputMap[event.code as keyof typeof keyToInputMap];
        if (input) this.state[input as keyof typeof this.state].pressed = true;
    }

    handleKeyUp(event: KeyboardEvent): void {
        const input = keyToInputMap[event.code as keyof typeof keyToInputMap];
        if (input) this.state[input as keyof typeof this.state].pressed = false;
    }
}
