import React from 'react';
import crate from "../svg/crate.svg";
import brickWall from "../svg/brick-wall.svg";
import worker from "../svg/worker.svg";
import refresh from "../svg/refresh.svg";
import info from "../svg/info.svg";
import { ReactComponent as Typhoon } from "./typhoon.svg";
import { Position, GameState, GameProps } from '../ts/IGame';
import Direction, { opposite } from '../ts/Direction';
import '../styles/Game.scss';
import {GameMenu} from "./GameMenu";
import KeyMap, {defaultKeyMap} from "../ts/KeyMap";
import Teleporter, {PorterColors} from "../ts/Teleporter";
import {overlap} from "../util/Util";
import {Editor} from "./Editor";
import {MapGrid} from "./MapGrid";
import {filterBoxesAndTargets, filterPorters} from "../util/GameUtil";
import {Navigate, useParams} from 'react-router-dom';
import {getLocalData, setLocalData} from "../ts/LocalData";
import {campaignLevels} from "../ts/const";
import WinAlert from "./WinAlert";

interface GameProps2 extends GameProps {
    map: number
}

class _Game extends React.Component<GameProps2, GameState> {
    protected height: number = 0;
    protected width: number = 0

    private static campaign = campaignLevels;
    private maps: string[][] = [];
    private map: string[] = [];
    protected isMount: boolean = false;

    constructor(props: GameProps2) {
        super(props);
        console.log(props);
        this.configureMap((props.mapPool || _Game.campaign)[props.map]);

        // this.init(
        //     Game.campaign
        // );
        // this.init([require('./maps/1.json'), require('./maps/2.json')]);
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

        const startPosition = map.indexOf('S');
        const newState = {
            map: map.replaceAll(/[^W]/g, ' '),
            player: {
                x: startPosition % this.width,
                y: ~~(startPosition / this.width)
            },
            ...filterBoxesAndTargets(map, {x: this.width, y: this.height}),
            credits: false,
            porters: filterPorters(map, {x: this.width, y: this.height}),
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

        for (let { blue, orange } of this.state.porters) {
             const blueIndex   = blue.x         + blue.y         * this.width;
             const orangeIndex = orange.x       + orange.y       * this.width;
             const playerIndex = nextPosition.x + nextPosition.y * this.width;

             if (blueIndex   === playerIndex && !overlap(orange, this.state.boxes)) nextPosition = orange;
             if (orangeIndex === playerIndex && !overlap(blue, this.state.boxes)  ) nextPosition = blue;
        }
        // Pull box if behind
        const behind = this.move(this.state.player, opposite(direction));

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
            this.props.onWin?.(this.props.map);
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
                    overflowX: 'hidden',
                } as React.CSSProperties
            }>
                <MapGrid
                    gameElements={this.state}
                    map={this.state.map}
                    gridSize={{x: this.width, y: this.height}}

                    custom={
                        {
                            [this.width - 2]: (<div
                                className="cell" key={this.width - 2}
                                style={{ backgroundImage: `url(${brickWall})`}}
                                onClick={() => this.configureMap(this.map)}
                            ><button style={{ backgroundImage: `url(${refresh})` }} className="btn-reset btn" title="Restart"></button>
                            </div>),
                            3: (<div
                                    className="cell" key={3}
                                    style={{backgroundImage: `url(${brickWall})`}}
                                    onClick={() => this.setState({ credits: !this.state.credits })}
                            ><button style={{backgroundImage: `url(${info})`}} className="btn-reset btn" title="Info"></button>
                            </div>)
                        }
                    }
                />

            <GameMenu
                visible={this.state.credits}
                keymap= {this.state.keyMap}
                onKeyMapChange={(keyMap) => this.setState({ keyMap })}
            />
                {this.props.winMessage && this.isWin() && <WinAlert {...this.props.winMessage} />}
            </div>
        );
    }
}

export default function Game(props: GameProps) {
    const {mapId} = useParams();
    console.log(+(mapId||"0"))

    if (mapId === undefined) return <Navigate to="/campaign/0" />
    if (isNaN(+mapId)) return <Navigate to="/campaign/0" />

    const localData = getLocalData();

    if (localData.reachedCampaignLevel < +mapId) return <Navigate to={`/campaign/${localData.reachedCampaignLevel}`} />

    return (<>
    <_Game {...props} map={+(mapId||"0")}/>
</>)
}