import {MapGrid} from "./MapGrid";
import {filterBoxesAndTargets, filterPorters} from "../util/GameUtil";
import React, {useState} from "react";
import "../styles/Game.scss"
import "../styles/MapPicker.scss"
import {Link, useNavigate} from "react-router-dom";
import {getLocalData, withLocalData} from "../ts/LocalData";
import {ReactComponent as TrashCan} from "../svg/trashcan.svg";
import {ReactComponent as Home} from "../svg/home.svg";

export function MapPicker() {
    const [maps, setMaps] = useState(getLocalData().personalMaps);
    const navigate = useNavigate();
    return (
        <>
            <div className="flex flex-row map-picker-header">
                <div className=""><Link to={"/"} className={"button"} title="Main Menu"><Home /><span>SukOnAn</span></Link></div>
                <div className="title">Own Maps</div>
            </div>
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
                padding: "1rem",
                gap: "1rem",
                overflow: "hidden scroll",
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
                                    porters:   filterPorters(mapString, gridSize),
                                    ...filterBoxesAndTargets(mapString, gridSize)
                                }}
                                gridSize={gridSize}/>
                            <div className="map-picker-map-buttons">
                                <button onClick={() => navigate(`/own/${i}`)}>
                                    Play 
                                </button>
                                <button onClick={() => navigate(`/editor/${i}`)}>
                                    Edit 
                                </button>
                                <button onClick={() => {
                                    if (window.confirm("Are You sure, You want to delete this map?\n(it will be lost forever)")) {
                                        setMaps(withLocalData((localData) => {
                                            localData.personalMaps = localData.personalMaps.filter((_, index) => index !== i);
                                            return localData;
                                        }).personalMaps)
                                    }
                                }}>
                                    <TrashCan style={{fill: "darkred"}} />
                                </button>
                            </div>
                        </div>)
                })}
            </div>}
        </>
    )
}