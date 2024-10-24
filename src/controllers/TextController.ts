import { Color, FillGradient, Text, TextStyle } from "../pixi.mjs";
import { clearCustomInterval, setCustomInterval } from "../utils";


export class TextController {
    //@ts-ignore
    app: _Application;
    curText: Text | null;
    curScaleId: number | null;

    //@ts-ignore
    constructor(app: _Application) {
        this.app = app;
        this.curText = null;
        this.curScaleId = null;
    }

    displayText(message: string): void {
        if (this.curText) { this.destroyCurText(); }

        const fill = new FillGradient(0, 0, 0, 60);
        const colors = [0xffcccc, 0xc7e9ff].map((color) => Color.shared.setValue(color).toNumber());
        colors.forEach((number, index) => { fill.addColorStop(index / colors.length, number); });
        
        const t = new Text({
            text: message,
            style: new TextStyle({
                fontFamily: 'Verdana',
                fontSize: 34,
                fill: { fill },
            }),
        });
    
        t.anchor.set(0.5);
        t.position.x = 250;
        t.position.y = 200;
        t.label = "mainText";
        t.zIndex = -1;
        this.app.stage.addChild(t);
        this.curText = t;
    
        let s = 1;
        let dir = 1;
    
        this.curScaleId = setCustomInterval(() => {
            t.scale?.set(s, s);
            s += dir * 0.004;
            if (s >= 1.3) {
                dir = -1;
            } 
            if (s <= 1) {
                dir = 1;
            }
        }, 15);
    }

    destroyCurText(): void {
        if (this.curScaleId) { clearCustomInterval(this.curScaleId); }
        if (this.curText) { this.curText.destroy(); }
        
        this.curScaleId = null;
        this.curText = null;
    }
}