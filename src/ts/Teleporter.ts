import { Position } from "./IGame";

export default interface Teleporter {
    orange: Position;
    blue: Position;
    color?: string;
};

export const PorterColors = [
    "#f39c12",
    "#2980b9",
    "#c0392b",
    "#e056fd",
    "#2ecc71",
    "#f1c40f",
    "#8e44ad",
    "#f8c291",
    "#000000",
];
