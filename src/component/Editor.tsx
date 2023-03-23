import React from "react";
import {MapGrid} from "./MapGrid";
import Teleporter from "../ts/Teleporter";
import {Position} from "../ts/IGame";
import brickWall from "../svg/brick-wall.svg";
import { ReactComponent as Export} from "../svg/save.svg";
import info from "../svg/info.svg";
import {filterBoxesAndTargets, filterPorters} from "../util/GameUtil";
import {NavigateFunction, useNavigate, useParams} from "react-router-dom";
import {getLocalData, setLocalData} from "../ts/LocalData";

class EditorPage extends React.Component<{navigate: NavigateFunction, ownMapIndex?:number}, {
    map: string[],
    size: Position,
    loading: boolean,
}> {
    private isMount = false;
    static readonly minSize = 5;
    static readonly elements = " WBTS123456789"
    static readonly _defaultMap = "W".repeat(EditorPage.minSize) + "W   W".repeat(EditorPage.minSize - 2) +  "W".repeat(EditorPage.minSize)
    static readonly defaultSize = {x: EditorPage.minSize, y: EditorPage.minSize}
    static readonly defaultMap : string[] = EditorPage._defaultMap.match(new RegExp(`.{1,${EditorPage.minSize}}`, 'g'))!

    constructor(props: {navigate: NavigateFunction, ownMapIndex?:number}) {
        super(props);
        const localData = getLocalData()
        console.log(props.ownMapIndex)

        const selectedMap = localData.personalMaps[props.ownMapIndex ?? -1];

        const map = (selectedMap === undefined) ? EditorPage.defaultMap : [
                        "W".repeat(selectedMap[0].length + 2),
                        ...selectedMap.map(it => `W${it}W`),
                        "W".repeat(selectedMap[0].length + 2)
                    ]

        this.state = {
            map,
            size: {x: map[0].length, y: map.length},
            loading: true
        };
    }

    private exportMap = () => {
        const map = this.state.map.splice(
            1, this.state.size.y - 2
        ).map(it => it.slice(1, this.state.size.x - 1))

        const maps = JSON.parse(localStorage.getItem("sukonan-maps") || "[]");

        alert("Map saved! You can now access it in the game menu.");

        const localData = getLocalData();

        if (this.props.ownMapIndex === undefined)
            localData.personalMaps = [...localData.personalMaps, map];
        else localData.personalMaps[this.props.ownMapIndex] = map;

        setLocalData(localData);

        return JSON.stringify(map);
    }

    private nextElement = (element: string, delta: number) => {
        const index = EditorPage.elements.indexOf(element);
        return EditorPage.elements[(index + delta + EditorPage.elements.length) % EditorPage.elements.length];
    }



    onLeftClick = (index: number) => {
        const x = index % this.state.size.x;
        const y = ~~(index / this.state.size.x);

        this.state.map[y] = this.state.map[y].slice(0, x) + this.nextElement(this.state.map[y][x], 1) + this.state.map[y].slice(x + 1);
        this.setState({map: this.state.map})
        console.log(this.state.map);
    }

    onRightClick = (index: number) => {
        const x = index % this.state.size.x;
        const y = ~~(index / this.state.size.x);

        this.state.map[y] = this.state.map[y].slice(0, x) + this.nextElement(this.state.map[y][x], -1) + this.state.map[y].slice(x + 1);
        this.setState({map: this.state.map})
    }

    extendMap = (deltaX: number, deltaY: number) => {
        if (deltaY) {
            for (let i = 0; i < deltaY; i++) {
                this.state.map[this.state.map.length - 1] = "W" + " ".repeat(this.state.size.x - 2) + "W";
                this.state.map.push("W".repeat(this.state.size.x));
            }
        }
        if (deltaX) {
            for (let i = 0; i < this.state.size.y; i++) {
                this.state.map[i] = this.state.map[i].substring(0, this.state.size.x - 1)
                this.state.map[i] += (
                    (i === 0 || i === this.state.size.y - 1)?"W":" "
                ).repeat(deltaX) + "W";
            }
        }
        this.setState({
            map: this.state.map,
            size: {x: this.state.size.x + deltaX, y: this.state.size.y + deltaY}
        })
    }

    reduceMap = (deltaX: number, deltaY: number) => {
        if (this.state.size.x - deltaX < EditorPage.minSize || this.state.size.y - deltaY < EditorPage.minSize) return;

        if (deltaY) {
            for (let i = 0; i < deltaY; i++) {
                this.state.map.pop();
                this.state.map[this.state.map.length - 1] = "W".repeat(this.state.size.x);
            }
        }
        if (deltaX) {
            for (let i = 0; i < this.state.size.y; i++) {
                this.state.map[i] = this.state.map[i].substring(0, this.state.size.x - 1 - deltaX) + "W";
            }
        }
        this.setState({
            map: this.state.map,
            size: {x: this.state.size.x - deltaX, y: this.state.size.y - deltaY}
        })
    }

    render() {
        const playerPosition = this.state.map.join("").indexOf("S");

        const player = playerPosition === -1 ? {x: -1, y: -1} : {
            x: playerPosition % this.state.size.x,
            y: ~~(playerPosition / this.state.size.x)
        }
        console.log(this.state)

        return (
            <div style={
                {
                    position: 'relative',
                    "--cell-size": `min(
                                    calc(100dvh / ${this.state.size.y}),
                                    calc(100dvw / ${this.state.size.x})
                                   )`,
                } as React.CSSProperties
            }>
            <MapGrid gameElements={{
                player,
                porters: filterPorters(this.state.map.join(''), this.state.size),
                ...filterBoxesAndTargets(this.state.map.join(''), this.state.size)
            }}
                     map={this.state.map.join('')}
                     gridSize={ this.state.size }
                     onLeftClick={this.onLeftClick}
                     onRightClick={this.onRightClick}
                     custom={
                         {
                             [this.state.size.x - 1]: (<div
                                 className="cell flex-row" key={this.state.size.x  - 1}
                                 style={{backgroundImage: `url(${brickWall})`,}}>
                                 <button
                                     className="btn-reset btn-size"
                                     title="Reduce X"
                                     onClick={() => this.reduceMap(1, 0)}>-</button>
                                 <button
                                     className="btn-reset btn-size"
                                     title="Increase X"
                                     onClick={() => this.extendMap(1, 0)}>+</button>
                                 </div>),
                             [this.state.size.x * (this.state.size.y - 1)]: (<div
                                 className="cell flex-row" key={this.state.size.x * (this.state.size.y - 1)}
                                 style={{backgroundImage: `url(${brickWall})`,}}>
                                 <button
                                     className="btn-reset btn-size"
                                     title="Reduce Y"
                                     onClick={() => this.reduceMap(0, 1)}>-</button>
                                 <button
                                     className="btn-reset btn-size"
                                     title="Increase Y"
                                     onClick={() => this.extendMap(0, 1)}>+</button>
                             </div>),
                             [this.state.size.x * this.state.size.y - 1]: (<div
                                    className="cell flex flex-row flex-center" key={this.state.size.x * this.state.size.y - 1}
                                    style={{backgroundImage: `url(${brickWall})`}}>
                                 <button
                                     className="btn-reset btn-size"
                                     title="Save Map"
                                     style={{
                                         backgroundSize: "cover",
                                         fontSize: "0"
                                     }}
                                     onClick={() => this.exportMap()}><Export style={{
                                        stroke: "white",
                                        width: "calc(var(--cell-size) / /2)",
                                        // strokeWidth: "2em"
                                     }}/></button>
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
            </div>
        );
    }
}

export function Editor() {
    const {mapId} = useParams();
    const ownMapIndex = (mapId === undefined || isNaN(+mapId))?undefined:+mapId;
    return <EditorPage navigate={useNavigate()} ownMapIndex={ownMapIndex}/>
}