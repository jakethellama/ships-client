import { Application, Assets, Sprite, Point } from './pixi.mjs';
import { KeyboardController } from './controllers/KeyboardController';
import { Packet } from './classes/logic/Packet';
import { CommandController } from './controllers/CommandController';
import { PredictionController } from './controllers/PredictionController';
import { LobbyController } from './controllers/LobbyController';
import { InterpController } from './controllers/InterpController';
import { setCustomInterval, clearCustomInterval } from './utils';
import { sendWithLatency, WSIP } from './utils';
import { EnemyContainer } from './classes/pixi/EnemyContainer';
import { SelfContainer } from './classes/pixi/SelfContainer';
import { TextController } from './controllers/TextController';

(async () => {
    const app = new Application();
    await app.init({ background: '#a0a0a0', width: 500, height: 500 });
    document.body.appendChild(app.canvas);

    Assets.addBundle('ships', {
        self: '../dist/assets/selfShip.png',
        selfBoost: '../dist/assets/selfShipBoost.png',
        enemy: '../dist/assets/enemyShip.png',
        enemyBoost: '../dist/assets/enemyShipBoost.png',

    });

    // @ts-ignore
    const shipAssets = await Assets.loadBundle('ships');

    const tc = new TextController(app);

    tc.displayText("Connecting...");

    const ws = new WebSocket('ws://' + WSIP + ':8080');
    
    ws.addEventListener('open', () => {
        console.log('Websocket Connected');
        // @ts-ignore
        app.ticker.maxFPS = 60;
    });

    ws.addEventListener('message', (e) => {
        const message = JSON.parse(e.data);

        if (message.type === 'initial') {
            initGame(message.payload.pid, app, ws, shipAssets, tc);
        }
    });


})();

// @ts-ignore
const initGame = (pid: number, app: _Application, ws: WebSocket, shipAssets, tc: TextController ) => {
    const selfContainer = new SelfContainer(pid, Sprite.from(shipAssets.self), Sprite.from(shipAssets.selfBoost));
    const enemyContainer = new EnemyContainer(pid === 0 ? 1 : 0, Sprite.from(shipAssets.enemy), Sprite.from(shipAssets.enemyBoost));
    app.stage.addChild(enemyContainer);
    app.stage.addChild(selfContainer);

    const lc = new LobbyController(selfContainer, enemyContainer);
    const kc = new KeyboardController();
    const cc = new CommandController(ws);
    const pc = new PredictionController();
    const ic = new InterpController(enemyContainer);

    ws.addEventListener('message', (e) => {
        const message = JSON.parse(e.data);

        switch (message.type) {
        case 'ping':
            sendWithLatency(ws, 'pong', {});
            break;
        case 'startSelf': {
            setTimeout(() => {
                startGame(cc, kc, selfContainer, enemyContainer, pc, ws, app);
                
                setTimeout(() => {
                    tc.destroyCurText();

                    selfContainer.setMovState(message.payload.playerState);
    
                    lc.startSelf();
                }, 500);
            }, 1500);
            // you won't send/receive updates or snapshots until start
            break;
        }
        case 'startEnemy': {
            setTimeout(() => {
                enemyContainer.setMovState(message.payload.playerState);

                lc.startEnemy();
            }, 2050);
            break;
        }
        case 'respawnSelf': {
            setTimeout(() => {
                tc.destroyCurText();

                lc.respawnSelf();
            }, 2000);
            break;
        }
        case 'respawnEnemy': {
            setTimeout(() => {
                tc.destroyCurText();

                lc.respawnEnemy();
            }, 2000);
            break;
        }
        case 'disconnect': {
            console.log(`Enemy has Disconnected`);

            lc.disconnectEnemy();

            ic.reset();
            break;
        }
        case 'update': {
            pc.reconcilePrediction(message.payload.playerState, cc, selfContainer);
            if (message.payload.playerState.health <= 0) {
                // mimicked on the server, this prevents trading
                selfContainer.isAlive = false;
            }
            break;
        }
        case 'snapshot': {
            ic.storeSnapshot(message.payload.playerState);
            enemyContainer.setHealth(message.payload.playerState.health);
            if (enemyContainer.health <= 0) {
                enemyContainer.alpha = 0;
                enemyContainer.isAlive = false;

                tc.displayText("You Win!");
            }
            message.payload.playerState.fireStatus.forEach((fireFrame: Point, index: number) => {
                const ff = new Point(fireFrame.x, fireFrame.y);
                if (index === 0) {
                    enemyContainer.fireFrame = ff;
                    if (!ff.equals(new Point(0,0)) && !ff.equals(new Point(-1,-1)) && selfContainer.alpha === 1) {
                        selfContainer.decHealth(1);
                        if (selfContainer.health <= 0) {
                            selfContainer.alpha = 0;
                            
                            tc.displayText("Respawning...");
                        }
                    }
                } else {
                    setTimeout(() => {
                        enemyContainer.fireFrame = ff;
                        if (!ff.equals(new Point(0,0)) && !ff.equals(new Point(-1,-1)) && selfContainer.alpha === 1) {
                            selfContainer.decHealth(1);
                            if (selfContainer.health <= 0) {
                                selfContainer.alpha = 0;

                                tc.displayText("Respawning...");
                            }    
                        }
                    }, 14.5 * index);
                }
            });
            break;
        }
        }
    });
};

// @ts-ignore
const startGame = (cc: CommandController, kc: KeyboardController, selfContainer: SelfContainer, enemyContainer: EnemyContainer, pc: PredictionController, ws: WebSocket, app: _Application) => {
    setCustomInterval(() => {
        // sampling input and making movement predictions
        const keyCommand = cc.makeKeyCommand(kc);

        cc.addKeyCommandToPacket(keyCommand);

        const actCommand = cc.makeActCommand();
    
        if (kc.state.KeyD.isPressed) {
            actCommand.right = true;
            selfContainer.rotateRight();
        }
        if (kc.state.KeyA.isPressed) {
            actCommand.left = true;
            selfContainer.rotateLeft();
        }
        if (kc.state.KeyW.isPressed) {
            actCommand.forward = true;
            selfContainer.moveForward();
            selfContainer.showBoost();
        } else {
            selfContainer.hideBoost();
        }
        if (kc.state.KeyS.isPressed) {
            actCommand.brake = true;
            selfContainer.moveBackward();
            selfContainer.showBoost();
        }
        selfContainer.checkWarp();
    
        selfContainer.updateLocalTransform();

        if (kc.state.Space.isPressed && selfContainer.isAlive) {
            actCommand.fire = true;
        }
    
        pc.savePrediction(selfContainer);
    }, 15);

    app.ticker.add(() => {
        // this is for things that are purely visual client side
        if (kc.state.Space.isPressed && selfContainer.isAlive) {
            selfContainer.showLaser(enemyContainer);
        } else {
            selfContainer.hideLaser();
        }

        if (enemyContainer.fireFrame.equals(new Point(0, 0))) {
            enemyContainer.hideLaser();
        } else {
            enemyContainer.drawLaser(selfContainer);
        }
    });

};