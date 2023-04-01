import React, {useCallback, useEffect} from 'react';
import refresh from "../svg/refresh.svg";
import info from "../svg/info.svg";
import { Position, GameState, GameProps } from '../ts/IGame';
import Direction, { opposite } from '../ts/Direction';
import '../styles/Game.scss';
import {GameMenu} from "./GameMenu";
import {saveKeyMap} from "../ts/KeyMap";
import {overlap} from "../util/Util";
import {MapGrid} from "./MapGrid";
import {filterBoxesAndTargets, filterPorters} from "../util/GameUtil";
import {Navigate, useNavigate, useParams} from 'react-router-dom';
import {campaignLevels} from "../ts/const";
import WinAlert from "./WinAlert";
import {defaultLocalData, withLocalData} from "../ts/LocalData";

function GameMap(props: GameProps & {map: number, onMove?: (moveNumber: number) => void}) {
    const navigate = useNavigate();

    const mapToParse = (props.mapPool || campaignLevels)[props.map];
    const configureMap = useCallback((mapToParse: string[]) : GameState => {
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
    }, [props.keymap])

    const [gameState, setGameState] = React.useState<GameState>(configureMap(mapToParse));
    const isWin = useCallback(() : boolean => {
        // Every Target Is Covered By Box
        return gameState.targets.every(
            box => gameState.boxes.some(target => target.x === box.x && target.y === box.y)
        );
    }, [gameState.boxes, gameState.targets])

    const move = useCallback((position: Position, direction: Direction) : Position | null => {
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
    }, [gameState.map, gameState.width])

    const movePlayer = useCallback((direction: Direction) : boolean => {
        if (gameState.credits) return false;

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

            props.onMove?.(1);
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
    }, [gameState, isWin, move, props])

    const handleKeyDown = useCallback((event: KeyboardEvent) => {
        const keyMap = gameState.keyMap;

        if (event.code === keyMap.restart) {
            return setGameState(configureMap(mapToParse));
        }

        if (event.code === keyMap.menu) {
            return setGameState((old) => ({ ...old, credits: !old.credits }));
        }

        if (keyMap.up.includes(event.code)) {
            return movePlayer(Direction.NORTH)
        }
        if (keyMap.down.includes(event.code)) {
            return movePlayer(Direction.SOUTH)
        }
        if (keyMap.left.includes(event.code)) {
            return movePlayer(Direction.WEST)
        }
        if (keyMap.right.includes(event.code)) {
            return movePlayer(Direction.EAST)
        }
    }, [configureMap, gameState.keyMap, mapToParse, movePlayer])

    const handleTouchStart = useCallback((event: TouchEvent) => {
        let target = event.target as HTMLElement;

        while (!target.classList.contains("cell"))
            target = target.parentElement as HTMLElement;
        
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
    }, [gameState.player, gameState.width, movePlayer])

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
                            onClick={() => setGameState(configureMap(mapToParse))}
                        ><button style={{ backgroundImage: `url(${refresh})` }} className="btn-reset btn" title="Restart"></button>
                        </div>),
                        3: (<div
                            className="cell flex-center" key={3}
                            onClick={() => setGameState((old) => ({ ...old, credits: !old.credits }))}
                        ><button style={{backgroundImage: `url(${info})`}} className="btn-reset btn" title={gameState.credits ? 'Close' : 'Info'}></button>
                        </div>),
                        0: (<div
                            title="Main Menu"
                            className="cell" key={0}
                            style={{
                                lineHeight: 'calc(var(--cell-size))',
                                fontSize: 'calc(var(--cell-size) * 0.5)',
                                color: 'white',
                                paddingInlineStart: '.5em',
                                cursor: 'pointer',
                            }}
                            onClick={() => {
                                // Main Menu
                                if (window.confirm("Are you sure you want to go back to the main menu?\nCurrent Level progress will be lost."))
                                    navigate('/');
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
            {props.winMessage && isWin() && <WinAlert {...props.winMessage} map={props.map} />}
        </div>
    );
}
export default function Game(props: GameProps & {onMove?: (moveNumber: number) => void}) {
    const {mapId} = useParams();

    if (mapId === undefined) return <Navigate to="/" replace/>
    if (isNaN(+mapId))       return <Navigate to="/" replace/>
    if (+mapId < 0)          return <Navigate to="/" replace/>

    for (let condition of (props.conditions || [])) {
        if (condition.func(+mapId)) return condition.element as any ;
    }

    if (+mapId === 0) {
        withLocalData((localData) => {
            localData.currentPlayerScore = {...defaultLocalData.currentPlayerScore};
        })
    }

    return (<GameMap {...props} map={+(mapId)} key={mapId} />)
}
