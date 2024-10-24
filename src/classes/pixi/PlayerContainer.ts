import { Edge } from './Edge';
import {
    Container, Graphics, Sprite, Point,
    ObservablePoint
} from '../../pixi.mjs';
import { ShipShape } from './ShipShape';
import { PlayerState } from '../logic/PlayerState';
import { HealthBar } from './HealthBar';

export class PlayerContainer extends Container {
    health: number;
    pid: number;
    rotationSpeed: number;
    accelSpeed: number;
    isAlive: boolean;
    
    constructor(pid: number, sprite?: Sprite, spriteBoost?: Sprite) {
        super();

        if (sprite) {
            sprite.anchor.set(0.5);
            sprite.scale.set(1.25, 1.25);
            this.addChild(sprite);
        }

        if (spriteBoost) {
            spriteBoost.anchor.set(0.5);
            spriteBoost.scale.set(1.25, 1.25);
            spriteBoost.label = 'spriteBoost';
            spriteBoost.alpha = 0;
            this.addChild(spriteBoost);
        }
        
        const hitbox = new ShipShape();
        hitbox.label = 'hitbox';
        hitbox.alpha = 0;

        const laser = new Graphics({});
        laser.position.set(0, -30);     // stems from tip of ship
        laser.alpha = 0;
        laser.label = 'laser';

        this.health = 100;
        const healthBar = new HealthBar(this.health);
        healthBar.label = 'healthBar';

        this.pid = pid;
        this.isAlive = false;

        this.addChild(hitbox);
        this.addChild(laser);
        this.addChild(healthBar);
        this.rotationSpeed = 0.09;
        this.accelSpeed = 3.1;

        this.alpha = 0;
    }

    hideLaser(): void {
        (this.getChildByLabel('laser') as Graphics).alpha = 0;
    }

    rotateRight(): void {
        this.rotation += this.rotationSpeed;
    }

    rotateLeft(): void {
        this.rotation -= this.rotationSpeed;
    }

    moveForward(): void {
        this.x += this.accelSpeed * Math.sin(this.rotation);
        this.y -= this.accelSpeed * Math.cos(this.rotation);
    }

    moveBackward(): void {
        this.x -= this.accelSpeed * Math.sin(this.rotation);
        this.y += this.accelSpeed * Math.cos(this.rotation);
    }

    checkWarp(): void {
        if (this.x > 500) {
            this.x -= 500;
        } else if (this.x < 0) {
            this.x += 500;
        }

        if (this.y > 500) {
            this.y -= 500;
        } else if (this.y < 0) {
            this.y += 500;
        }
    }
    
    setHealth(health: number) {
        this.decHealth(this.health - health);
    }

    decHealth(delta: number) {
        const hb = (this.getChildByLabel('healthBar') as HealthBar);

        if (this.health >= 0) {
            this.health -= delta;
        }

        if (this.health < 0) {
            this.health = 0;
        }

        hb.setHealth(this.health);
    }

    showBoost(): void {
        (this.getChildByLabel('spriteBoost') as Sprite).alpha = 1;
    }

    hideBoost(): void {
        (this.getChildByLabel('spriteBoost') as Sprite).alpha = 0;
    }

    setMovState(ps: PlayerState): void {
        this.position.x = ps.position.x;
        this.position.y = ps.position.y;
        this.rotation = ps.rotation;
        this.updateLocalTransform();
    }

}
