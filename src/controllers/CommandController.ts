import { Command } from '../classes/logic/Command';
import { Packet } from '../classes/logic/Packet';
import { sendWithLatency } from '../utils';

export class CommandController {
    commandHistory: Command[];
    curCid: number;
    curPacket: Packet;

    ws: WebSocket;

    constructor(ws: WebSocket) {
        this.commandHistory = new Array<Command>(100);
        this.curCid = 0;
        this.curPacket = new Packet();

        this.ws = ws;
    }

    getCommand(cid: number): Command | null {
        if ((this.curCid - cid) > 66) {
            // cid is over 990 ms ago, cannot access
            return null;
        } else {
            return this.commandHistory[cid % 100];
        }
    }

    makeCommand(): Command {
        const command = new Command(this.curCid);
        this.commandHistory[this.curCid % 100] = command;

        this.curCid += 1;
        return command;
    }

    addCommandToPacket(command: Command): void {
        this.curPacket.commands.push(command);

        if (this.curPacket.commands.length === 2) {
            sendWithLatency(this.ws, 'packet', { packet: this.curPacket });

            this.curPacket = new Packet();
        }
    }
}
