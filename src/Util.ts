import {Position} from "./IGame";

export function overlap(position: Position, positions: Position[]): boolean {
    return positions.some((p) => p.x === position.x && p.y === position.y);
}