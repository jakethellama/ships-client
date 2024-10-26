import { ActCommand } from '../classes/logic/ActCommand';
import { KeyCommand } from '../classes/logic/KeyCommand';
import { Packet } from '../classes/logic/Packet';
import { sendWithLatency } from '../utils';
import { KeyboardController } from './KeyboardController';

export class CommandController {
    actCommandHistory: ActCommand[];
    curCid: number;
    curPacket: Packet;

    ws: WebSocket;

    constructor(ws: WebSocket) {
        this.actCommandHistory = new Array<ActCommand>(100);        this.curCid = 0;
        this.curPacket = new Packet();

        this.ws = ws;
    }

    getActCommand(cid: number): ActCommand | null {
        if ((this.curCid - cid) > 66) {
            // cid is over 990 ms ago, cannot access
            return null;
        } else {
            return this.actCommandHistory[cid % 100];
        }
    }

    makeKeyCommand(kc: KeyboardController): KeyCommand {
        const keyCommand = new KeyCommand(this.curCid);

        for (let [key, state] of Object.entries(kc.state)) {
            if (state.firstDown) {
                keyCommand.keyArr.push(key + "-Down");
                state.firstDown = false;
            }
            if (state.up) {
                keyCommand.keyArr.push(key + "-Up");
                state.up = false;
            }
        }

        return keyCommand;
    }

    makeActCommand(): ActCommand {
        const actCommand = new ActCommand(this.curCid);
        this.actCommandHistory[this.curCid % 100] = actCommand;

        this.curCid += 1;
        return actCommand;
    }

    addKeyCommandToPacket(keyCommand: KeyCommand): void {
        this.curPacket.keyCommands.push(keyCommand);

        if (this.curPacket.keyCommands.length === 2) {
            // always send first packet, don't send empty packets
            if (this.curPacket.keyCommands[0].cid === 0) {
                sendWithLatency(this.ws, 'packet', { packet: this.curPacket });
            } else if (this.curPacket.keyCommands[0].keyArr.length > 0 || 
                    this.curPacket.keyCommands[1].keyArr.length > 0) {
                sendWithLatency(this.ws, 'packet', { packet: this.curPacket });
            }
                
            this.curPacket = new Packet();
        }
    }
}
