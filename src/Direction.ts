enum Direction {
    NORTH = 0,
    SOUTH,
    EAST,
    WEST,
}

export function opposite(direction: Direction): Direction {
    switch (direction) {
        case Direction.NORTH: return Direction.SOUTH;
        case Direction.SOUTH: return Direction.NORTH;
        case Direction.EAST: return Direction.WEST;
        case Direction.WEST: return Direction.EAST;
    }
}

export default Direction;