import {Position} from "../ts/IGame";

export function overlap(position: Position, positions: Position[]): boolean {
    return positions.some((p) => p.x === position.x && p.y === position.y);
}

export function isValidLevel(level: string) : boolean {
    // if no start point
    if (level.indexOf("S") === -1) {
        return false;
    }
    // if more targets than boxes
    if (level.replaceAll(/[^T]/g, "").length > level.replaceAll(/[^B]/g, "").length) {
        return false;
    }

    for (let i = 1; i <= 9; i++) {
        const porters = level.replaceAll(new RegExp(`[^${i}]`, "g"), "");
        // if the count of same porters is not 2 and porter exists
        if (porters.length !== 0 && porters.length !== 2) {
            return false;
        }
    }
    return true;
}