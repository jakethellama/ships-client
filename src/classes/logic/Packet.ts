import { Command } from "./Command";

export class Packet {
    commands: Command[]; 

    constructor() {
        this.commands = [];

    }
}
