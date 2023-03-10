import React from 'react';
import crate from "./crate.svg";
import brickWall from "./brick-wall.svg";
import worker from "./worker.svg";
import refresh from "./refresh.svg";
import info from "./info.svg";
import { Position, GameState, GameProps } from './IGame';
import Direction, { opposite } from './Direction';
import './Game.scss';
import {GameMenu} from "./GameMenu";
import KeyMap, {defaultKeyMap} from "./KeyMap";
import Teleporter, {PorterColors} from "./Teleporter";


export default class Game extends React.Component<GameProps, GameState> {
    protected height: number = 0;
    protected width: number = 0

    private maps: string[][] = [];
    private map: string[] = [];
    protected isMount: boolean = false;

    constructor(props: GameProps) {
        super(props);
        this.init([require('./maps/1.json'), require('./maps/2.json')]);
    }
    private configureMap(mapToParse: string[]) {
        console.log("m", mapToParse)
        this.height = mapToParse.length + 2;
        console.assert(this.height, "Height can only be non negative integer");
        this.width = mapToParse[0].length + 2;
        console.assert(mapToParse.every(it => it.length === this.width - 2), "Each row has to be same size" + mapToParse);       

        let map = "";
            map += 'W'.repeat(this.width);
            map += mapToParse.reduce((prev, now) => `${prev}W${now}W`, '');
            map += 'W'.repeat(this.width);

	    this.map = mapToParse;

        const boxes: Position[] = [];
        const targets: Position[] = [];
        const porters: Record<number, Position[]> = {};
        for (let x = 0; x < this.width; x++) {
            for (let y = 0; y < this.height; y++) {
                const element = map[x + y * this.width];
                if (element === 'B') {
                    boxes.push({x, y});
                }
                if (element === 'T') {
                    targets.push({x, y});
                }
                if (+element > 0 && +element <= 9) {
                    porters[+element] = porters[+element] || [];
                    porters[+element].push({x, y});
                } 
            }
        }
        console.log(porters);
        const startPosition = map.indexOf('S');
        const newState = {
            map: map.replaceAll(/[^W]/g, ' '),
            player: {
	        x: startPosition % this.width,
	        y: ~~(startPosition / this.width)
            },
            boxes: boxes,
            targets: targets,
            credits: false,
            porters: [] as Teleporter[],
        }

        for (let [blue, orange] of Object.values(porters)) {
            newState.porters.push({
                blue, orange,
                color: PorterColors[+map[blue.x + blue.y * this.width] - 1],
            })
        }
	
        if (this.isMount) {
            this.setState(newState);
        } else this.state = { ...newState, keyMap: defaultKeyMap};
    }
    private init = (maps?: string[][]) => {
        console.log("constructor");
        if (maps) {
            this.maps = maps;
        }
        const mapToParse = this.maps.shift();

        if (!mapToParse) {
            throw new Error("No map to parse");
        }

        this.configureMap(mapToParse);
    }

    componentWillUnmount() {
        document.removeEventListener("keydown", this.handleKeyDown);
        document.removeEventListener("touchstart",  this.handleTouchStart);

        this.isMount = false;
    }

    componentDidMount() {
        document.addEventListener("keydown", this.handleKeyDown);
        document.addEventListener("touchstart",  this.handleTouchStart);

        this.isMount = true;
    }

    private isWin() : boolean {
        // Every Target Is Covered By Box
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
            return null;
        }
        return newPosition;
    }


    private movePlayer = (direction: Direction) : boolean => {
        let nextPosition = this.move(this.state.player, direction);

        // Wall Collision
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

        for (let {blue, orange} of this.state.porters) {
             const blueIndex = blue.x + blue.y * this.width;
             const orangeIndex = orange.x + orange.y * this.width;
             const playerIndex = nextPosition.x + nextPosition.y * this.width;
           
             // Todo: add box in teleporter collision check
             if (blueIndex === playerIndex) nextPosition = orange;
             if (orangeIndex === playerIndex) nextPosition = blue;
        }
        // Pull box if behind
        const behind = this.move(this.state.player, opposite(direction));
        // Todo: add a switch to enable/disable this feature
        if (behind !== null) {
            for (let i = 0; i < this.state.boxes.length; ++i) {
                const box = this.state.boxes[i];
                if (box.x === behind.x && box.y === behind.y) {
                    this.state.boxes[i] = this.state.player;
                }
            }
        }

        this.setState(() => ({
            player: nextPosition!,
            boxes: this.state.boxes
        }))

        if (this.isWin()) setTimeout(() => {
            try {
                this.init();
                alert("You win!");
            } catch {
		alert("End Of Levels. Good Job! Pag");
            }
        }, 0);

        return true;
    }

    protected handleKeyDown = (event: KeyboardEvent) => {
        if (event.code === this.state.keyMap.restart) {
            return this.configureMap(this.map);
        }

        if (event.code === this.state.keyMap.menu) {
            return this.setState({ credits: !this.state.credits });
        }

        if (this.state.keyMap.up.includes(event.code)) {
            return this.movePlayer(Direction.NORTH)
        }
        if (this.state.keyMap.down.includes(event.code)) {
            return this.movePlayer(Direction.SOUTH)
        }
        if (this.state.keyMap.left.includes(event.code)) {
            return this.movePlayer(Direction.WEST)
        }
        if (this.state.keyMap.right.includes(event.code)) {
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
        const pp = this.state.player;

        return (
            <div style={
                {
                    position: 'relative',
                    "--cell-size": `min(
                                    calc(100dvh / ${this.height}),
                                    calc(100dvw / ${this.width})
                                   )`,
                } as React.CSSProperties
            }>
            <div style={
                {
                    display: 'grid',
                    gridTemplate: `repeat(${this.height}, var(--cell-size)) / repeat(${this.width}, auto)`,
                    width: 'fit-content',
                    background: "black",
                }
            }>
                {this.state.map.split('').map((element, i) => {
                    if (i === this.width - 2) { // Restart button
                        return (
                            <div className="cell" key={i} style={{
                                backgroundImage: `url(${brickWall})`
                            }} onClick={() => this.configureMap(this.map)}>
                                <button style={{ backgroundImage: `url(${refresh})` }} className="btn-reset btn" title="Restart"></button>
                            </div>
                        )
                    }

                    if (i === 3) { // Info button
                        return (
                            <div className="cell" key={i} style={{
                                backgroundImage: `url(${brickWall})`
                            }} onClick={() => this.setState({ credits: !this.state.credits })}
                            >
                                <button style={{backgroundImage: `url(${info})`}} className="btn-reset btn" title="Info"></button>
                            </div>
                        )
                    }
                    
                    const isPorter = (index: number) => {
                        for (let porter of this.state.porters) {
                            if (porter.blue.x + porter.blue.y * this.width == index) return porter.color || "black";
                            if (porter.orange.x + porter.orange.y * this.width == index) return porter.color || "black";
                        }
                        return undefined;
                    }

                    return <div className="cell" key={i} style={{
                        background: element === 'W' ? `url(${brickWall})` : (isPorter(i) ?? '#95a5a6'),
                        zIndex: this.width * this.height - i,
                    }}>
                        { /* player */ }
                        { (i === pp.x + pp.y * (this.width)) && <span style={{
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

                        { /* title */ }
                        { (i === 0) && <span style={{
                            margin: 0,
                            fontSize:  `min(
                                calc(100dvh / ${this.height} / 1.5),
                                calc(100dvw / ${this.width} / 1.5)
                            )`,
                            color: 'white',
                        }}>Sukanob</span>}
                    </div>
                })}
            </div>
            <GameMenu
                visible={this.state.credits}
                keymap={this.state.keyMap}
                onKeyMapChange={(keyMap) => this.setState({ keyMap })}
            />
            </div>
        );
    }
}

