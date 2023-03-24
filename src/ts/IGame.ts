import KeyMap from "./KeyMap";
import Teleporter from "./Teleporter";
import {ReactNode} from "react";
import {WinAlertProps} from "../component/WinAlert";

export interface Position {
    x: number,
    y: number
}

export interface GameProps {
    onWin?: (mapId: number) => void,
    map?: number,
    mapPool?: string[][],
    keymap: KeyMap,
    winMessage?: WinAlertProps,
    conditions?: {func: (mapId: number) => boolean, element: ReactNode}[]
}

export interface GameElements {
    player: Position,
    boxes: Position[],
    targets: Position[],
    porters: Teleporter[],
}

export interface GameState extends GameElements {
    map: string,
    credits: boolean,
    keyMap: KeyMap,
    readonly width: number,
    readonly height: number,
}


