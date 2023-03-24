import React, {useEffect} from 'react';
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
import KeyMap, {defaultKeyMap, saveKeyMap, getKeyMap} from "../ts/KeyMap";
import Teleporter, {PorterColors} from "../ts/Teleporter";
import {overlap} from "../util/Util";
import {Editor} from "./Editor";
import {MapGrid} from "./MapGrid";
import {filterBoxesAndTargets, filterPorters} from "../util/GameUtil";
import {Navigate, NavigateFunction, useNavigate, useParams} from 'react-router-dom';
import {getLocalData, setLocalData} from "../ts/LocalData";
import {campaignLevels} from "../ts/const";
import WinAlert from "./WinAlert";

interface GameProps2 extends GameProps {
    map: number,
    navigate: NavigateFunction,
}

export function Game1(props: GameProps2) {
    const mapToParse = (props.mapPool || campaignLevels)[props.map];
    const configureMap = (mapToParse: string[]) : GameState => {
        const height = mapToParse.length + 2;
        const width  = mapToParse[0].length + 2;

        const parsedMap = 'W'.repeat(width) +
            mapToParse.reduce((prev, now) => `${prev}W${now}W`, '') +
            'W'.repeat(width);

        const startPosition = parsedMap.indexOf('S');

        return {
            player: {
                x: startPosition % width,
                y: Math.floor(startPosition / width),
            },
            map: parsedMap.replaceAll(/[^W]/g, ' '),
            porters: filterPorters(parsedMap, {x: width, y: height}),
            ...filterBoxesAndTargets(parsedMap, {x: width, y: height}),
            credits: false,
            keyMap: props.keymap,
            width, height
        }
    }

    const [gameState, setGameState] = React.useState<GameState>(configureMap(mapToParse));
    const isWin = () : boolean => {
        // Every Target Is Covered By Box
        return gameState.targets.every(
            box => gameState.boxes.some(target => target.x === box.x && target.y === box.y)
        );
    }

    const move = (position: Position, direction: Direction) : Position | null => {
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
        if (gameState.map[newPosition.x + newPosition.y * gameState.width] === 'W') {
            return null;
        }
        return newPosition;
    }

    const movePlayer = (direction: Direction) : boolean => {
        let nextPosition = move(gameState.player, direction);

        // Wall Collision
        if (nextPosition === null) {
            return false;
        }
        const moveBoxes = (position: Position, direction: Direction, boxIndex?:number) : boolean => {
            for (let i = 0; i < gameState.boxes.length; ++i) {
                if (boxIndex !== undefined && i === boxIndex) {
                    continue;
                }
                const box = gameState.boxes[i];
                // if box is not in position continue
                if (box.x !== position.x || box.y !== position.y) {
                    continue;
                }

                const newBoxPosition = move(box, direction);
                if (newBoxPosition === null) {
                    console.log("box(es) didn't move (wall)", box, position);
                    return false;
                }
                for (let j = 0; j < gameState.boxes.length; ++j) {
                    if (i === j) continue;
                    if (gameState.boxes[j].x === newBoxPosition.x && gameState.boxes[j].y === newBoxPosition.y) {
                        const moved = moveBoxes(newBoxPosition, direction, i);

                        if (!moved) {
                            console.log("box(es) cannot move (other boxes cannot)", box, position);
                            return false;
                        }
                    }
                }
                // Box did move, update state
                gameState.boxes[i] = newBoxPosition;
            }
            return true;
        }

        if (!moveBoxes(nextPosition, direction)) return false;

        for (let { blue, orange } of gameState.porters) {
            const blueIndex   = blue.x         + blue.y         * gameState.width;
            const orangeIndex = orange.x       + orange.y       * gameState.width;
            const playerIndex = nextPosition.x + nextPosition.y * gameState.width;

            if (blueIndex   === playerIndex && !overlap(orange, gameState.boxes)) nextPosition = orange;
            if (orangeIndex === playerIndex && !overlap(blue, gameState.boxes)  ) nextPosition = blue;
        }
        // Pull box if behind
        const behind = move(gameState.player, opposite(direction));

        if (behind !== null) {
            for (let i = 0; i < gameState.boxes.length; ++i) {
                const box = gameState.boxes[i];
                if (box.x === behind.x && box.y === behind.y) {
                    gameState.boxes[i] = gameState.player;
                }
            }
        }

        setGameState((old) => ({
            ...old,
            player: nextPosition!,
            boxes: gameState.boxes
        }))

        if (isWin()) setTimeout(() => {
            props.onWin?.(props.map);
        }, 0);

        return true;
    }
    const handleKeyDown = (event: KeyboardEvent) => {
        if (event.code === gameState.keyMap.restart) {
            return configureMap(mapToParse);
        }

        if (event.code === gameState.keyMap.menu) {
            return setGameState((old) => ({ ...old, credits: !old.credits }));
        }

        if (gameState.keyMap.up.includes(event.code)) {
            return movePlayer(Direction.NORTH)
        }
        if (gameState.keyMap.down.includes(event.code)) {
            return movePlayer(Direction.SOUTH)
        }
        if (gameState.keyMap.left.includes(event.code)) {
            return movePlayer(Direction.WEST)
        }
        if (gameState.keyMap.right.includes(event.code)) {
            return movePlayer(Direction.EAST)
        }
    }

    const handleTouchStart = (event: TouchEvent) => {
        let target = event.target as HTMLElement;
        if (target instanceof HTMLSpanElement) {
            target = target.parentElement as HTMLElement;
        }
        let grid = target.parentElement as HTMLElement;
        if (grid === null || !grid.children) return;

        for (let i = 0; i < grid.children.length; ++i) {
            const child = grid.children[i];
            if (child !== target) continue

            const cell = {x: i % gameState.width, y: ~~(i / gameState.width)};
            const player = gameState.player;

            if (cell.x === player.x && cell.y === player.y) {
                return;
            }
            if (cell.x === player.x) {
                movePlayer(
                    cell.y > player.y ? Direction.SOUTH : Direction.NORTH
                )
            } else if (cell.y === player.y) {
                movePlayer(
                    cell.x > player.x ? Direction.EAST : Direction.WEST
                )
            }
        }
    }
    
    useEffect(() => {
        document.addEventListener("keydown", handleKeyDown);
        document.addEventListener("touchstart",  handleTouchStart);

        return () => {
            document.removeEventListener("keydown", handleKeyDown);
            document.removeEventListener("touchstart",  handleTouchStart);
        }
    }, [handleKeyDown, handleTouchStart]);

    return (
        <div style={
            {
                position: 'relative',
                "--cell-size": `min(
                                    calc(100dvh / ${gameState.height}),
                                    calc(100dvw / ${gameState.width})
                                   )`,
                overflowX: 'hidden',
            } as React.CSSProperties
        }>
            <MapGrid
                gameElements={gameState}
                map={gameState.map}
                gridSize={{x: gameState.width, y: gameState.height}}

                custom={
                    {
                        [gameState.width - 1]: (<div
                            className="cell flex-center" key={gameState.width - 1}
                            style={{ backgroundImage: `url(${brickWall})`}}
                            onClick={() => setGameState(configureMap(mapToParse))}
                        ><button style={{ backgroundImage: `url(${refresh})` }} className="btn-reset btn" title="Restart"></button>
                        </div>),
                        3: (<div
                            className="cell flex-center" key={3}
                            style={{backgroundImage: `url(${brickWall})`}}
                            onClick={() => setGameState((old) => ({ ...old, credits: !old.credits }))}
                        ><button style={{backgroundImage: `url(${info})`}} className="btn-reset btn" title={gameState.credits ? 'Close' : 'Info'}></button>
                        </div>),
                        0: (<div
                            title="Main Menu"
                            className="cell" key={0}
                            style={{
                                backgroundImage: `url(${brickWall})`,
                                lineHeight: 'calc(var(--cell-size))',
                                fontSize: 'calc(var(--cell-size) * 0.5)',
                                color: 'white',
                                paddingInlineStart: '.5em',
                                cursor: 'pointer',
                            }}
                            onClick={() => {
                                // Main Menu
                                if (window.confirm("Are you sure you want to go back to the main menu?\nCurrent Level progress will be lost."))
                                    props.navigate('/');
                            }}
                        >SukOnAn
                        </div>)
                    }
                }
            />

            <GameMenu
                visible={gameState.credits}
                keymap= {gameState.keyMap}
                onKeyMapChange={(keyMap) => {setGameState((old) => ({ ...old, keyMap })); saveKeyMap({...keyMap}); } }
            />
            {props.winMessage && isWin() && <WinAlert {...props.winMessage} />}
        </div>
    );
}
/*
class _Game extends React.Component<GameProps2, GameState> {
    protected height: number = 0;
    protected width: number = 0

    private static campaign = campaignLevels;
    private maps: string[][] = [];
    private map: string[] = [];
    protected isMount: boolean = false;

    constructor(props: GameProps2) {
        super(props);
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
        } else this.state = { ...newState, keyMap: this.props.keymap};
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

    componentDidUpdate(prevProps: Readonly<GameProps2>, prevState: Readonly<GameState>, snapshot?: any) {
        if (this.props.map !== prevProps.map) {
            this.configureMap((this.props.mapPool || _Game.campaign)[this.props.map]);
        }
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
                            [this.width - 1]: (<div
                                className="cell flex-center" key={this.width - 1}
                                style={{ backgroundImage: `url(${brickWall})`}}
                                onClick={() => this.configureMap(this.map)}
                            ><button style={{ backgroundImage: `url(${refresh})` }} className="btn-reset btn" title="Restart"></button>
                            </div>),
                            3: (<div
                                    className="cell flex-center" key={3}
                                    style={{backgroundImage: `url(${brickWall})`}}
                                    onClick={() => this.setState({ credits: !this.state.credits })}
                            ><button style={{backgroundImage: `url(${info})`}} className="btn-reset btn" title={this.state.credits ? 'Close' : 'Info'}></button>
                            </div>),
                            0: (<div
                                title="Main Menu"
                                className="cell" key={0}
                                style={{
                                    backgroundImage: `url(${brickWall})`,
                                    lineHeight: 'calc(var(--cell-size))',
                                    fontSize: 'calc(var(--cell-size) * 0.5)',
                                    color: 'white',
                                    paddingInlineStart: '.5em',
                                    cursor: 'pointer',
                                }}
                                onClick={() => {
                                    // Main Menu
                                    if (window.confirm("Are you sure you want to go back to the main menu?\nCurrent Level progress will be lost."))
                                        this.props.navigate('/');
                                }}
                            >SukOnAn
                            </div>)
                        }
                    }
                />

            <GameMenu
                visible={this.state.credits}
                keymap= {this.state.keyMap}
                onKeyMapChange={(keyMap) => {this.setState({ keyMap }); saveKeyMap({...keyMap}); } }
            />
                {this.props.winMessage && this.isWin() && <WinAlert {...this.props.winMessage} />}
            </div>
        );
    }
}
*/
export default function Game(props: GameProps) {
    const {mapId} = useParams();
    const navigate = useNavigate();
    console.log(+(mapId||"0"))

    if (mapId === undefined) return <Navigate to="/" replace/>
    if (isNaN(+mapId))       return <Navigate to="/" replace/>
    if (+mapId < 0)          return <Navigate to="/" replace/>

    for (let condition of (props.conditions || [])) {
        if (condition.func(+mapId)) return condition.element as any ;
    }

    return (<>
        <Game1 navigate={navigate} {...props} map={+(mapId||"0")} key={mapId} />
    </>)
}
