import { Graphics, Point, Sprite } from "../../pixi.mjs";
import { EnemyContainer } from "./EnemyContainer";
import { PlayerContainer } from "./PlayerContainer";
import { closeEnough } from "../../utils";
import { ShipShape } from "./ShipShape";
import { Edge } from "./Edge";

export class SelfContainer extends PlayerContainer {
    // eslint-disable-next-line @typescript-eslint/no-useless-constructor
    constructor(pid: number, sprite: Sprite, spriteBoost: Sprite) {
        super(pid, sprite, spriteBoost);
    }

    showLaser(ec: EnemyContainer): void {
        // losing health is applied on server confirmation
        // thus laser is only a visual effect client side, like a prediction

        const laser = (this.getChildByLabel('laser') as Graphics);
        const hitData = this.#checkHitscanOn(ec);

        if (hitData.doesHit && ec.isAlive) {
            const hitPointLocal = this.localTransform.applyInverse(new Point(hitData.hitPointG.x, hitData.hitPointG.y));

            laser.clear();
            laser.lineTo(hitPointLocal.x, hitPointLocal.y + 30);
        } else {
            laser.clear();
            laser.lineTo(0, -1000);
        }
        
        laser.stroke({ width: 1, color: 'cyan' });
        laser.alpha = 0.86;
    }

    #checkHitscanOn(ec: EnemyContainer): {doesHit: boolean, hitPointG: Point } {
        // laser definition
        const theta = this.rotation;
        const origin = ((this.getChildByLabel('laser') as Graphics).getGlobalPosition() as Point); // this is immediately updated, unlike worldTransform

        // check if laser hits each edge
        let doesHit = false;
        let hitPointG: Point = new Point();
        let minDist = Infinity;

        const hitbox = (ec.getChildByLabel('hitbox') as ShipShape);

        for (let i = 1; i < 5; i++) {
            const va = ec.localTransform.apply(new Point((hitbox[`e${i}`] as Edge).va.x, (hitbox[`e${i}`] as Edge).va.y));
            const vb = ec.localTransform.apply(new Point((hitbox[`e${i}`] as Edge).vb.x, (hitbox[`e${i}`] as Edge).vb.y));

            // everything now in global coords since the parent of the containers is app
            const intData = this.#checkRayIntersectSegment(theta, origin, va, vb);

            if (intData.doesIntersect) {
                doesHit = true;

                if (intData.dist < minDist) {
                    minDist = intData.dist;
                    hitPointG = intData.intPoint;
                }
            }
        }

        return { doesHit, hitPointG };
    }

    #checkRayIntersectSegment(theta: number, origin: Point, p1: Point, p2: Point): {doesIntersect: boolean, intPoint: Point, dist: number} {
        // Ray Line Equation
        let m1 = (Math.cos(theta) / Math.sin(theta)) * -1;
        if (m1 === -Infinity || m1 === Infinity) {
            m1 = 123456789123456;
        }
        const b1 = origin.y - (m1 * origin.x);

        // Segment Line Equation
        let m2 = ((p2.y - p1.y) / (p2.x - p1.x));
        if (m2 === -Infinity || m2 === Infinity) {
            m2 = 123456789123456;
        }
        const b2 = p1.y - (m2 * p1.x);

        // parallel lines
        if (m1 === m2 && b1 !== b2) {
            return { doesIntersect: false, intPoint: new Point(), dist: 0 };
        }

        // intersection point
        const ix = (b2 - b1) / (m1 - m2);
        const iy = (m1 * ix) + b1;

        // check if the intersection point is in the segment
        const segMinX = Math.min(p1.x, p2.x);
        const segMinY = Math.min(p1.y, p2.y);
        const segMaxX = Math.max(p1.x, p2.x);
        const segMaxY = Math.max(p1.y, p2.y);

        if (!(ix >= segMinX && ix <= segMaxX && iy >= segMinY && iy <= segMaxY)) {
            return { doesIntersect: false, intPoint: new Point(), dist: 0 };
        }

        // check if the intersection point is behind the player
        const dist = Math.sqrt((ix - origin.x) ** 2 + (iy - origin.y) ** 2);
        const jx = origin.x + (dist * Math.sin(theta));
        const jy = origin.y - (dist * Math.cos(theta));

        if (closeEnough(jx, ix) && closeEnough(jy, iy)) {
            return { doesIntersect: true, intPoint: new Point(ix, iy), dist };
        } else {
            return { doesIntersect: false, intPoint: new Point(), dist: 0 };
        }
    }
    
}

