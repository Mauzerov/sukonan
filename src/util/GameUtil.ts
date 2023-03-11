import Teleporter, {PorterColors} from "../ts/Teleporter";
import {Position} from "../ts/IGame";

export function filterPorters(map: string, size: Position): Teleporter[] {
    const porters: Record<number, Position[]> = {};

    for (let x = 0; x < size.x; x++) {
        for (let y = 0; y < size.y; y++) {
            const element = map[x + y * size.x];
            if (+element > 0 && +element <= 9) {
                porters[+element] = porters[+element] || [];
                porters[+element].push({x, y});
            }
        }
    }

    return Object.values(porters).map(([blue, orange]) => {
        return {
            blue, orange: orange || blue,
            color: PorterColors[+map[blue.x + blue.y * size.x] - 1],
        }
    })
}

export function filterBoxesAndTargets(map: string, size: Position) : {boxes: Position[], targets: Position[]} {
    const boxes: Position[] = [];
    const targets: Position[] = [];
    for (let x = 0; x < size.x; x++) {
        for (let y = 0; y < size.y; y++) {
            const element = map[x + y * size.x];
            if (element === 'B') {
                boxes.push({x, y});
            }
            if (element === 'T') {
                targets.push({x, y});
            }
        }
    }
    return {boxes, targets};
}