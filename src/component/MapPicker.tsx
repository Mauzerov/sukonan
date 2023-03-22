import {MapGrid} from "./MapGrid";
import {filterBoxesAndTargets, filterPorters} from "../util/GameUtil";
import React from "react";
import "../styles/Game.scss"
import "../styles/MapPicker.scss"
import {Link} from "react-router-dom";

export function MapPicker(
    props: {
        onMapSelect?: (map: number) => void
    }
) {
    const maps = JSON.parse(localStorage.getItem('sukonan-maps') || '[]')
    return (
        <>
            {!maps.length && <div
                className="map-picker__no-maps">
                No maps found. Create one in the editor.
                <Link to="/editor" className="button">Editor</Link>
            </div>}
            {maps && <div
                className={"map-picker"}
                style={{
                display: 'grid',
                // width: "100%",
                gap: "1rem",
                "--own-map-count": maps.length,
                // aspectRatio: "1 / 1",
            } as React.CSSProperties}>
                {maps && maps.map((map: string[], i: number) => {
                    const gridSize = {
                        x: map[0].length,
                        y: map.length,
                    }
                    const mapString = map.join('');
                    return (
                        <div key={i} style={{
                            "--cell-size": `auto`,
                            position: 'relative',
                        } as React.CSSProperties}
                        className="map-picker-map"
                        >
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
                            <div className="map-picker-map-buttons">
                                <button onClick={() => {props.onMapSelect?.(i)}}>
                                    Play 
                                </button>
                                <button>
                                    Edit 
                                </button>
                            </div>
                        </div>)
                })}
            </div>}
        </>
    )
}