import { Edge } from './Edge';
import {
    Container, Graphics, Sprite, Point
} from '../../pixi.mjs';

export class ShipShape extends Graphics {
    constructor() {
        super({});
        this.moveTo(100, 0);
        this.lineTo(200, 300);
        this.lineTo(100, 200);
        this.lineTo(0, 300);
        this.lineTo(100, 0);
        this.stroke({ color: '51ff3d', width: 5 });
        this.pivot.x = 100;
        this.pivot.y = 150;
        this.scale.set(0.2, 0.2);
    }

    // Coords within Parent, {x, y}
    get v1(): Point {
        return this.localTransform.apply(new Point(100, 0));
    }

    get v2(): Point {
        return this.localTransform.apply(new Point(200, 300));
    }

    get v3(): Point {
        return this.localTransform.apply(new Point(100, 200));
    }

    get v4(): Point {
        return this.localTransform.apply(new Point(0, 300));
    }

    // Coords within Parent
    // {va: {x,y}, vb: {x,y}}
    get e1(): Edge {
        return { va: this.v1, vb: this.v2 };
    }

    get e2(): Edge {
        return { va: this.v2, vb: this.v3 };
    }

    get e3(): Edge {
        return { va: this.v3, vb: this.v4 };
    }

    get e4(): Edge {
        return { va: this.v4, vb: this.v1 };
    }
}
