import {GameElements, GameState, Position} from "../ts/IGame";
import brickWall from "../svg/brick-wall.svg";
import refresh from "../svg/refresh.svg";
import info from "../svg/info.svg";
import worker from "../svg/worker.svg";
import crate from "../svg/crate.svg";
import React, {ReactNode} from "react";
import { ReactComponent as Typhoon} from "../svg/typhoon.svg";

interface MapGridProps {
    map: string,
    gameElements: GameElements,
    gridSize: Position,
    onLeftClick?: (index: number) => void,
    onRightClick?: (index: number) => void,

    custom?: Record<number, ReactNode>
}

export function MapGrid(props: MapGridProps) {
    const pp = props.gameElements.player;
    console.log(props);
    return (
        <div style={
            {
                display: 'grid',
                gridTemplate: `repeat(${props.gridSize.y}, var(--cell-size)) / repeat(${props.gridSize.x}, auto)`,
                width: 'fit-content',
                background: "black",
            }
        }>
            {props.map.split('').map((element, i) => {
                if (props.custom && props.custom[i]) {
                    return props.custom[i];
                }

                const isPorter = (index: number) => {
                    for (let porter of props.gameElements.porters) {
                        if (porter.blue.x + porter.blue.y * props.gridSize.x === index) return porter.color || "black";
                        if (porter.orange.x + porter.orange.y * props.gridSize.x === index) return porter.color || "black";
                    }
                    return undefined;
                }

                const isEdge = (index: number) => {
                    return index % props.gridSize.x === 0 || index % props.gridSize.x === props.gridSize.x - 1 || index < props.gridSize.x || index >= props.gridSize.x * (props.gridSize.y - 1);
                }

                return <div className="cell" key={i} style={{
                    background: element === 'W' ? `url(${brickWall})` : '#95a5a6',
                    zIndex: props.gridSize.x * props.gridSize.y - i,
                }}
                            onClick={(e) => {
                                if (isEdge(i)) return;
                                if (props.onLeftClick) {
                                    e.preventDefault();
                                    props.onLeftClick(i)
                                }
                            }}
                            onContextMenu={(e) => {
                                if (isEdge(i)) return;
                                if (props.onRightClick) {
                                    e.preventDefault();
                                    props.onRightClick(i)
                                }
                            }}
                >
                    { /* porter */ }
                    { isPorter(i) && <span style={
                        {padding: 'calc(var(--cell-size) / 8)'}
                    }><Typhoon style={{fill: isPorter(i)}}/></span>}

                    { /* player */ }
                    { (i === pp.x + pp.y * (props.gridSize.x)) && <span style={{
                        backgroundImage: `url(${worker})`,
                        zIndex: 2
                    }}></span>}

                    { /* boxes */ }
                    { props.gameElements.targets.some(
                        it => it.x + it.y * props.gridSize.x === i
                    ) && <span style={{
                        backgroundImage: `url(${crate})`,
                        opacity: '0.5'
                    }}></span>}

                    { /* targets */ }
                    { props.gameElements.boxes.some(
                        it => it.x + it.y * props.gridSize.x === i
                    ) && <span style={{
                        backgroundImage: `url(${crate})`,
                    }}></span>}

                    { /* title */ }
                    { (i === 0) && <span style={{
                        margin: 0,
                        fontSize:  `min(
                                calc(100dvh / ${props.gridSize.y} / 1.5),
                                calc(100dvw / ${props.gridSize.x} / 1.5)
                            )`,
                        color: 'white',
                    }}>Sukanob</span>}
                </div>
            })}
        </div>
    )
}