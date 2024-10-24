import { PlayerState } from "./PlayerState";

export class Command {
    // Command0 + State0 = State1
    cid: number; 
    
    right: boolean;
    left: boolean;
    forward: boolean;
    brake: boolean;
    
    fire: boolean;

    constructor(cid: number) {
        this.cid = cid;

        this.right = false;
        this.left = false;
        this.forward = false;
        this.brake = false;

        this.fire = false;
    }
}
