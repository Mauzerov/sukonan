import {MapGrid} from "./MapGrid";
import {filterBoxesAndTargets, filterPorters} from "../util/GameUtil";
import React from "react";
import "../styles/Game.scss"

export function MapPicker() {
    return (
        <div style={{
            display: 'grid',
            width: "100%",
            gridTemplateColumns: `repeat(5, auto)`,
            gap: "1rem",
            // aspectRatio: "1 / 1",
        } as React.CSSProperties}>
            {JSON.parse(localStorage.getItem('sukonan-maps') || '[]').map((map: string[], i: number) => {
                const gridSize = {
                    x: map[0].length,
                    y: map.length,
                }
                const mapString = map.join('');
                return (
                    <div style={{
                        "--cell-size": `auto`,
                        // aspectRatio: "1 / 1",
                    } as React.CSSProperties}>
                        <MapGrid
                            key={i}
                            map={mapString}
                            gameElements={{
                                player: {
                                    x: mapString.indexOf('S') % gridSize.x,
                                    y: Math.floor(mapString.indexOf('S') / gridSize.x),
                                },
                                porters: filterPorters(mapString, gridSize),
                                ...filterBoxesAndTargets(mapString, gridSize)
                            }}
                            gridSize={gridSize}/>
                    </div>)
            })}
        </div>
    )
}