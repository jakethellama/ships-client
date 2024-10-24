import { EnemyContainer } from "../classes/pixi/EnemyContainer";
import { PlayerContainer } from "../classes/pixi/PlayerContainer";
import { SelfContainer } from "../classes/pixi/SelfContainer";
import { Sprite } from "../pixi.mjs";

export class LobbyController {
    selfContainer: SelfContainer;
    enemyContainer: EnemyContainer;

    constructor(sc: SelfContainer, ec: EnemyContainer) { 
        this.selfContainer = sc;
        this.enemyContainer = ec;

    }

    startEnemy(): void {
        this.enemyContainer.alpha = 1;
        this.enemyContainer.isAlive = true;
        this.enemyContainer.setHealth(100);

    }

    disconnectEnemy(): void {
        this.enemyContainer.alpha = 0;
        this.enemyContainer.isAlive = false;
        this.selfContainer.setHealth(100);
    }
    
    startSelf(): void {
        this.selfContainer.alpha = 1;
        this.selfContainer.isAlive = true;
        this.selfContainer.setHealth(100);
    }

    respawnSelf(): void {
        this.selfContainer.alpha = 1;
        this.selfContainer.isAlive = true;
        this.selfContainer.setHealth(100);
        this.enemyContainer.setHealth(100);
    }

    respawnEnemy(): void {
        this.enemyContainer.alpha = 1;
        this.enemyContainer.isAlive = true;
        this.enemyContainer.setHealth(100);
        this.selfContainer.setHealth(100);
    }
}