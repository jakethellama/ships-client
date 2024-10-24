import { PlayerState } from "../classes/logic/PlayerState";
import { EnemyContainer } from "../classes/pixi/EnemyContainer";
import { PlayerContainer } from "../classes/pixi/PlayerContainer";
import { clearCustomInterval, setCustomInterval } from "../utils";

export class InterpController {
    snapArr: PlayerState[];
    setIndex: number;
    storeIndex: number;

    ec: EnemyContainer;
    timeouts: NodeJS.Timeout[];
    intervalId: number;

    waitingForCur: boolean;
    waitingForCurAt: number;

    constructor(ec: EnemyContainer) {
        this.snapArr = new Array<PlayerState>(100);
        this.setIndex = 0;
        this.storeIndex = 0;

        this.ec = ec;
        this.timeouts = [];
        this.intervalId = -1;

        this.waitingForCur = false;
        this.waitingForCurAt = -1;
    }

    storeSnapshot(snapshot: PlayerState): void {
        this.snapArr[this.storeIndex % 100] = snapshot;
        this.storeIndex += 1;

        if (this.storeIndex === 1) {
            this.initInterpLoop();
        } else if (this.waitingForCur) {
            this.waitingForCur = false;

            this.lateInterp(this.snapArr[(this.storeIndex - 2) % 100], snapshot, Date.now() - this.waitingForCurAt);
            this.waitingForCurAt = -1;
        }
    }

    initInterpLoop(): void {
        const id = setTimeout(() => {
            this.intervalId = setCustomInterval(() => {
                this.interpAndSet();
            }, 50);

            this.interpAndSet();
        }, 60);

        this.timeouts.push(id);
    }

    interpAndSet(): void {
        /*
            A regular arrival is when arrivalStat === -2
            A late arrival is when arrivalStat === -1
        */
        const arrivalStat = this.setIndex - this.storeIndex;

        if (arrivalStat !== -2) {
            console.log("Unexpected Arrival: " + arrivalStat + " Refresh if issue persists");
        }

        if (arrivalStat <= -2) {
            const prev = this.snapArr[this.setIndex % 100];
            const cur = this.snapArr[(this.setIndex + 1) % 100];

            this.setSnapshot(prev);
            this.regularInterp(prev, cur);
        } else if (arrivalStat === -1) {
            this.waitingForCur = true;
            this.waitingForCurAt = Date.now();

            this.setSnapshot(this.snapArr[this.setIndex % 100]);
        }  // if >= 0, skipped snapshots

        this.setIndex += 1;
    }

    regularInterp(prev: PlayerState, cur: PlayerState) {
        const id = setTimeout(() => {
            this.setSnapshot(this.interpStateAt(prev, cur, 15));
            this.timeouts.splice(this.timeouts.length - 2, 1);
        }, 15);
        this.timeouts.push(id);

        const id2 = setTimeout(() => {
            this.setSnapshot(this.interpStateAt(prev, cur, 30));
            this.timeouts.pop();
        }, 30);
        this.timeouts.push(id2);
    }

    lateInterp(prev: PlayerState, cur: PlayerState, since: number) {
        if (since < 49) {
            if (since < 29) {
                const id = setTimeout(() => {
                    this.setSnapshot(this.interpStateAt(prev, cur, 15));
                    this.timeouts.splice(this.timeouts.length - 2, 1);
                }, since > 15 ? 0 : 15 - since);
                this.timeouts.push(id);
            }
            
            const id2 = setTimeout(() => {
                this.setSnapshot(this.interpStateAt(prev, cur, 30));
                this.timeouts.pop();
            }, since > 30 ? 0 : 30 - since);
            this.timeouts.push(id2);
        }
    }

    interpStateAt(prev: PlayerState, cur: PlayerState, ms: number): PlayerState {
        // return interpolated state at ms ms 
        // 50 ms between prev and cur

        const out = new PlayerState(-1, prev.pid);

        if (cur.position.y - prev.position.y > 300) {
            // top edge warp
            out.position.y = this.interpValueAt(prev.position.y + 500, cur.position.y, ms) % 500;
        } else if (prev.position.y - cur.position.y > 300) {
            // bottom edge warp
            out.position.y = this.interpValueAt(prev.position.y, cur.position.y + 500, ms) % 500;
        } else {
            // no warp
            out.position.y = this.interpValueAt(prev.position.y, cur.position.y, ms);
        }

        if (cur.position.x - prev.position.x > 300) {
            // left edge warp
            out.position.x = this.interpValueAt(prev.position.x + 500, cur.position.x, ms) % 500;
        } else if (prev.position.x - cur.position.x > 300) {
            // right edge warp
            out.position.x = this.interpValueAt(prev.position.x, cur.position.x + 500, ms) % 500;
        } else {
            // no warp
            out.position.x = this.interpValueAt(prev.position.x, cur.position.x, ms);
        }

        out.rotation = this.interpValueAt(prev.rotation, cur.rotation, ms);
        
        return out;
    }

    interpValueAt(a: number, b: number, ms: number): number {
        // return interpolated value at ms ms
        // 50 ms between a and b

        return a + (ms * (b - a) / 50);
    }

    setSnapshot(snapshot: PlayerState): void {
        if ((this.ec.position.x !== snapshot.position.x) || (this.ec.position.y !== snapshot.position.y)) {
            this.ec.showBoost();
        } else {
            this.ec.hideBoost();
        }
        this.ec.setMovState(snapshot);
    }

    reset() {
        this.timeouts.forEach((id) => {
            clearTimeout(id);
        }); 

        if (this.intervalId !== -1) {
            clearCustomInterval(this.intervalId);
            this.intervalId = -1;
        }
        this.timeouts = [];

        this.snapArr = new Array<PlayerState>(100);
        this.setIndex = 0;
        this.storeIndex = 0;

        this.waitingForCur = false;
        this.waitingForCurAt = -1;
    }
}