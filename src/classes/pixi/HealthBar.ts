import { Container, Graphics } from "../../pixi.mjs";

export class HealthBar extends Container{
    maxHealth: number;

    constructor(maxHealth: number) {
        super();
        this.maxHealth = maxHealth;

        const bar = new Graphics({});
        bar.rect(-18, 40, 36, 10).fill();
        bar.tint = 0x00ff00;
        bar.label = 'bar';

        const outline = new Graphics({});
        outline.rect(-18, 40, 36, 10)
            .stroke({ color: 'white', width: 1 });
        outline.label = 'outline';

        this.addChild(bar);
        this.addChild(outline);
        this.alpha = 0.6;
    }

    setHealth(health: number) {
        const bar = (this.getChildByLabel('bar') as Graphics);

        const width = (36 * health) / this.maxHealth;

        bar.setSize(width, 10);
        bar.position.x = (width - 36) / 2;

        if ((health / this.maxHealth) < (33 / 100)) {
            bar.tint = 0xff0000;
            this.alpha = 0.70;
        } else if ((health / this.maxHealth) < (66 / 100)) {
            bar.tint = 0xffff00;
            this.alpha = 0.65;
        } else {
            bar.tint = 0x00ff00; 
            this.alpha = 0.6;
        }
    }
}