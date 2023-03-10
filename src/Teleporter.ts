import { Position } from "./IGame";

export default interface Teleporter {
    orange: Position;
    blue: Position;
    color?: string;
};

export const PorterColors = [
    "orange",
    "blue",
];
