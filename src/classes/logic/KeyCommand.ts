export class KeyCommand {   
    cid: number;
    keyArr: string[];
    // KeyA-Down, KeyD-Down, KeyW-Down, KeyS-Down, Space-Down
    // KeyA-Up, KeyD-Up, KeyW-Up, KeyS-Up, Space-Up
    
    constructor(cid: number) {
        this.cid = cid;
        this.keyArr = [];
    }
}
