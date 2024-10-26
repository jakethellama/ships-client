import { KeyCommand } from "./KeyCommand";

export class Packet {
    keyCommands: KeyCommand[]; 

    constructor() {
        this.keyCommands = [];

    }
}
