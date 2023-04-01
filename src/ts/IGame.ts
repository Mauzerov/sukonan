import KeyMap from "./KeyMap";
import Teleporter from "./Teleporter";
import {ReactNode} from "react";


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

export interface WinAlertProps {
    title: ReactNode,
    text?: ReactNode,
    buttons: {children: ReactNode, onClick: (() => void) | ((map: number) => void)}[],
}

export interface Score {
    name: string,
    score: number
}


