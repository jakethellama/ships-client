import { Graphics, Point, Sprite } from "../../pixi.mjs";
import { PlayerContainer } from "./PlayerContainer";
import { SelfContainer } from "./SelfContainer";

export class EnemyContainer extends PlayerContainer {
    fireFrame: Point;
    // hit, miss = -1, off = 0

    constructor(pid: number, sprite: Sprite, spriteBoost: Sprite) {
        super(pid, sprite, spriteBoost);

        this.fireFrame = new Point(0, 0);
    }

    drawLaser(sc: SelfContainer): void {
        const laser = (this.getChildByLabel('laser') as Graphics);

        if (this.fireFrame.equals(new Point(-1, -1)) || sc.alpha === 0) {
            laser.clear();
            laser.lineTo(0, -1000);
        } else {
            laser.clear();
            const hitPointG = sc.localTransform.apply(this.fireFrame);
            const hitPointL = this.localTransform.applyInverse(hitPointG);
            laser.lineTo(hitPointL.x, hitPointL.y + 30);
        }

        laser.stroke({ width: 1, color: '#ff1100' });
        laser.alpha = 0.86;
    }
}