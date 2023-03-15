import React from "react";
import {MapGrid} from "./MapGrid";
import Teleporter from "../ts/Teleporter";
import {Position} from "../ts/IGame";
import brickWall from "../svg/brick-wall.svg";
import info from "../svg/info.svg";
import {filterBoxesAndTargets, filterPorters} from "../util/GameUtil";

export class Editor extends React.Component<{}, {
    map: string[],
    size: Position,
    loading: boolean,
}> {
    static readonly minSize = 5;
    static readonly elements = " WBTS123456789"
    static readonly _defaultMap = "W".repeat(Editor.minSize) + "W   W".repeat(Editor.minSize - 2) +  "W".repeat(Editor.minSize)
    static readonly defaultSize = {x: Editor.minSize, y: Editor.minSize}
    static readonly defaultMap : string[] = Editor._defaultMap.match(new RegExp(`.{1,${Editor.minSize}}`, 'g'))!

    constructor(props: {}) {
        super(props);
        console.log(Editor.defaultMap);
        console.log(Editor._defaultMap);
        console.log(new RegExp(`.{1,${Editor.minSize}}`, 'g'))
        this.state = { map: Editor.defaultMap, size: {x: Editor.minSize, y: Editor.minSize }, loading: false};
    }

    private importMap = () => {
        const mapString = prompt("Import map");
        if (!mapString) return;

        const map = JSON.parse(mapString);

        this.setState({map: map, size: {x: map[0].length, y: map.length}})
    }

    private exportMap = () => {
        const map = this.state.map.splice(
            1, this.state.size.y - 2
        ).map(it => it.slice(1, this.state.size.x - 1))

        const maps = JSON.parse(localStorage.getItem("sukonan-maps") || "[]");

        alert("Map saved! You can now access it in the game menu.");

        localStorage.setItem("sukonan-maps", JSON.stringify([...maps, map]));

        return JSON.stringify(map);
    }

    private nextElement = (element: string, delta: number) => {
        const index = Editor.elements.indexOf(element);
        return Editor.elements[(index + delta + Editor.elements.length) % Editor.elements.length];
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
        console.log(this.state.map);
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
        if (this.state.size.x - deltaX < Editor.minSize || this.state.size.y - deltaY < Editor.minSize) return;

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
                                    className="cell flex-row" key={this.state.size.x * this.state.size.y - 1}
                                    style={{backgroundImage: `url(${brickWall})`,}}>
                                    <button
                                        className="btn-reset btn-size"
                                        title="Import"
                                        onClick={() => this.importMap()}>Import</button>
                                 <button
                                     className="btn-reset btn-size"
                                     title="Export"
                                     onClick={() => this.exportMap()}>Export</button>
                                </div>),
                         }
                     }
            />
            </div>
        );
    }
}