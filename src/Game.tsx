import React from 'react';
import { useState, useEffect } from "react";
import {default as map1} from "./maps/1.json";
import crate from "./crate.svg";
import brickWall from "./brick-wall.svg";
import worker from "./worker.svg";
import { Position, GameState, GameProps } from './IGame';
import Direction from './Direction';
import './Game.scss';


export default class Game extends React.Component<GameProps, GameState> {
    protected height: number;
    protected width: number;
    state: GameState = {
        player: {
            x: 0, y: 0
        },
        map: "",
        boxes: [],
        targets: []
    }
    constructor(props: GameProps) {
        super(props);

        console.log("constructor");//

        const mapToParse = map1;
        this.height = mapToParse.length + 2;
        console.assert(this.height, "Height can only be non negative integer");
        this.width = mapToParse[0].length + 2;
        console.assert(mapToParse.every(it => it.length === this.width - 2), "Each row has to be same size" + mapToParse);

        let map = "";
        map += 'W'.repeat(this.width);
        map += mapToParse.reduce((prev, now) => `${prev}W${now}W`, '');
        map += 'W'.repeat(this.width);

        const boxes: Position[] = [];
        const targets: Position[] = [];
        for (let x = 0; x < this.width; x++) {
            for (let y = 0; y < this.height; y++) {
                if (map[x + y * this.width] === 'B') {
                    boxes.push({x, y});
                }
                if (map[x + y * this.width] === 'T') {
                    targets.push({x, y});
                }
            }
        }

        const startPosition = map.indexOf('S');
        this.state = {
            map: map.replaceAll(/[^W]/g, ' '),
            player: {
                x: startPosition % this.width,
                y: ~~(startPosition / this.width)
            },
            boxes: boxes,
            targets: targets
        }
        console.log(this.state);
    }

    componentWillUnmount() {
        document.removeEventListener("keydown", this.handleKeyDown);
        document.removeEventListener("touchstart",  this.handleTouchStart);
    }

    componentDidMount() {
        document.addEventListener("keydown", this.handleKeyDown);
        document.addEventListener("touchstart",  this.handleTouchStart);
    }

    private isWin() : boolean {
        // Every Target Is Covered By Box
        console.log(JSON.stringify(this.state))//
        return this.state.targets.every(
            box => this.state.boxes.some(target => target.x === box.x && target.y === box.y)
        );
    }

    private move(position: Position, direction: Direction) : Position | null {
        const newPosition: Position = { ...position }
        switch (direction) {
            case Direction.NORTH:
                newPosition.y -= 1; break;
            case Direction.SOUTH:
                newPosition.y += 1; break;
            case Direction.EAST:
                newPosition.x += 1; break;
            case Direction.WEST:
                newPosition.x -= 1; break;
        }

        // Wall Collision
        if (this.state.map[newPosition.x + newPosition.y * this.width] === 'W') {
            return null; // return old position
        }
        return newPosition;
    }


    private movePlayer = (direction: Direction) : boolean => {
        let nextPosition = this.move(this.state.player, direction);

        if (nextPosition === null) {
            return false;
        }

        const moveBoxes = (position: Position, direction: Direction, boxIndex?:number) : boolean => {
            for (let i = 0; i < this.state.boxes.length; ++i) {
                if (boxIndex !== undefined && i === boxIndex) {
                    continue;
                }
                const box = this.state.boxes[i];

                // if box is not in position continue
                if (box.x !== position.x || box.y !== position.y) {
                    continue;
                }

                const newBoxPosition = this.move(box, direction);

                if (newBoxPosition === null) {
                    console.log("box(es) didn't move (wall)", box, position);
                    return false;
                }
                for (let j = 0; j < this.state.boxes.length; ++j) {
                    if (i === j) continue;
                    if (this.state.boxes[j].x === newBoxPosition.x && this.state.boxes[j].y === newBoxPosition.y) {
                        const moved = moveBoxes(newBoxPosition, direction, i);

                        if (!moved) {
                            console.log("box(es) cannot move (other boxes cannot)", box, position);
                            return false;
                        }
                    }
                }
                // Box did move, update state
                this.state.boxes[i] = newBoxPosition;
            }
            return true;
        }

        if (!moveBoxes(nextPosition, direction)) return false;

        this.setState(() => ({
            player: nextPosition!,
            boxes: this.state.boxes
        }))

        if (this.isWin()) setTimeout(() => {
            alert("You win!")
        }, 0);

        return true;
    }

    protected handleKeyDown = (event: KeyboardEvent) => {
        switch (event.key) {
            case "w":
            case "ArrowUp":
                return this.movePlayer(Direction.NORTH)
            case "s":
            case "ArrowDown":
                return this.movePlayer(Direction.SOUTH)
            case "a":
            case "ArrowLeft":
                return this.movePlayer(Direction.WEST)
            case "d":
            case "ArrowRight":
                return this.movePlayer(Direction.EAST)
        }
    }

    protected handleTouchStart = (event: TouchEvent) => {
        let target = event.target as HTMLElement;
        if (target instanceof HTMLSpanElement) {
            target = target.parentElement as HTMLElement;
        }
        let grid = target.parentElement as HTMLElement;
        if (grid === null || !grid.children) return;

        for (let i = 0; i < grid.children.length; ++i) {
            const child = grid.children[i];
            if (child !== target) continue

            const cell = {x: i % this.width, y: ~~(i / this.width)};
            const player = this.state.player;

            if (cell.x === player.x && cell.y === player.y) {
                return;
            }
            if (cell.x === player.x) {
                this.movePlayer(
                    cell.y > player.y ? Direction.SOUTH : Direction.NORTH
                )
            } else if (cell.y === player.y) {
                this.movePlayer(
                    cell.x > player.x ? Direction.EAST : Direction.WEST
                )
            }
        }
    }

    render() {
        const svgBgMap: Record<string, string> = {
            "W": `url(${brickWall})`,
            "B": `url(${crate})`,
        }

        const pp = this.state.player;
        return (
            <div style={
                {
                    display: 'grid',
                    gridTemplate: `repeat(${this.height}, 1fr) / repeat(${this.width}, 1fr)`,
                    width: 'fit-content',
                    background: "black"
                }
            }>
                {this.state.map.split('').map((element, i) => {
                    return <div className="cell" key={i} style={{
                        background: element === 'W' ? svgBgMap['W'] : '#95a5a6',
                        height: `min(calc(100dvh / ${this.height}), calc(100dvw / ${this.width}))`,
                    }}>
                        { /* player */ }
                        { i === pp.x + pp.y * (this.width) && <span style={{
                            backgroundImage: `url(${worker})`,
                            zIndex: 2
                        }}></span>}
                        { /* boxes */ }
                        { this.state.targets.some(it => it.x + it.y * this.width === i) && <span style={{
                            backgroundImage: `url(${crate})`,
                            opacity: '0.5'
                        }}></span>}
                        { /* targets */ }
                        { this.state.boxes.some(it => it.x + it.y * this.width === i) && <span style={{
                            backgroundImage: `url(${crate})`,
                        }}></span>}


                    </div>
                })}
            </div>
        );
    }
}