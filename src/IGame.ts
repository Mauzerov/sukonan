import KeyMap from "./KeyMap";
import Teleporter from "./Teleporter";

export interface Position {
    x: number,
    y: number
}

export interface GameProps {
}

export interface GameState {
    player: Position,
    boxes: Position[],
    map: string,
    targets: Position[],
    credits: boolean,
    keyMap: KeyMap,
    porters: Teleporter[],
}
