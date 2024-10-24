import { Command } from "../classes/logic/Command";
import { PlayerState } from "../classes/logic/PlayerState";
import { PlayerContainer } from "../classes/pixi/PlayerContainer";
import { SelfContainer } from "../classes/pixi/SelfContainer";
import { Container, Point } from "../pixi.mjs";
import { CommandController } from "./CommandController";

export class PredictionController {
    predictionHistory: PlayerState[];
    curPredId: number; 

    constructor() {
        this.predictionHistory = new Array<PlayerState>(100); 
        this.curPredId = 1;
    }

    savePrediction(sc: SelfContainer): void {
        const pred = new PlayerState(this.curPredId, sc.pid);
        pred.position.x = sc.position.x;
        pred.position.y = sc.position.y;
        pred.rotation = sc.rotation;

        this.predictionHistory[this.curPredId % 100] = pred;
        this.curPredId += 1;
    }

    savePredictionAt(pc: PlayerContainer, predId: number): void {
        const pred = new PlayerState(predId, pc.pid);
        pred.position.x = pc.position.x;
        pred.position.y = pc.position.y;
        pred.rotation = pc.rotation;

        this.predictionHistory[predId % 100] = pred;
    }

    reconcilePrediction(update: PlayerState, cc: CommandController, selfContainer: SelfContainer): void {
        const sid = update.sid;
        const pred = this.getPrediction(sid);

        if (pred) {
            if (pred.isEquals(update)) {
                // current state is as accurate as possible
            } else {
                // reconcile the states, produce new state based on received server state
                let predId = update.sid;
                
                let pc = new PlayerContainer(update.pid);
                pc.setMovState(update);

                while (predId < this.curPredId - 1) {
                    const c = cc.getCommand(predId)!;

                    if (c.right) {
                        pc.rotateRight();
                    }
                    if (c.left) {
                        pc.rotateLeft();
                    }
                    if (c.forward) {
                        pc.moveForward();
                    }
                    if (c.brake) {
                        pc.moveBackward();
                    }
                    selfContainer.checkWarp();

                    predId += 1;
                    this.savePredictionAt(pc, predId);
                }

                selfContainer.position.x = pc.position.x;
                selfContainer.position.y = pc.position.y;
                selfContainer.rotation = pc.rotation;
                selfContainer.updateLocalTransform();
            }
        } else {
            // do nothing, prediction is too old
        }
    }

    getPrediction(sid: number): PlayerState | null {
        if ((this.curPredId - sid) > 66) {
            // sid is over 990 ms ago, too late to use, do nothing with it
            return null;
        } else {
            return this.predictionHistory[sid % 100];
        }
    }

}