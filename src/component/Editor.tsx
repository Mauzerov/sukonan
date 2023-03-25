import React, {useCallback, useEffect, useState} from "react";
import {MapGrid} from "./MapGrid";
import {Position} from "../ts/IGame";
import brickWall from "../svg/brick-wall.svg";
import { ReactComponent as Export} from "../svg/save.svg";
import {filterBoxesAndTargets, filterPorters} from "../util/GameUtil";
import {useNavigate, useParams} from "react-router-dom";
import {getLocalData, setLocalData} from "../ts/LocalData";

// class EditorPage extends React.Component<
//     {navigate: NavigateFunction, ownMapIndex?:number},
// {
//     map: string[],
//     size: Position,
//     loading: boolean,
// }> {
//     private isMount = false;
//     static readonly minSize = 5;
//     static readonly elements = " WBTS123456789"
//     static readonly _defaultMap = "W".repeat(EditorPage.minSize) + "W   W".repeat(EditorPage.minSize - 2) +  "W".repeat(EditorPage.minSize)
//     static readonly defaultSize = {x: EditorPage.minSize, y: EditorPage.minSize}
//     static readonly defaultMap : string[] = EditorPage._defaultMap.match(new RegExp(`.{1,${EditorPage.minSize}}`, 'g'))!
//
//     constructor(props: {navigate: NavigateFunction, ownMapIndex?:number}) {
//         super(props);
//         const localData = getLocalData()
//         console.log(props.ownMapIndex)
//
//         const selectedMap = localData.personalMaps[props.ownMapIndex ?? -1];
//
//         const map = (selectedMap === undefined) ? EditorPage.defaultMap : [
//                         "W".repeat(selectedMap[0].length + 2),
//                         ...selectedMap.map(it => `W${it}W`),
//                         "W".repeat(selectedMap[0].length + 2)
//                     ]
//
//         this.state = {
//             map,
//             size: {x: map[0].length, y: map.length},
//             loading: true
//         };
//     }
//
//     private exportMap = () => {
//         const map = this.state.map.splice(
//             1, this.state.size.y - 2
//         ).map(it => it.slice(1, this.state.size.x - 1))
//
//         const maps = JSON.parse(localStorage.getItem("sukonan-maps") || "[]");
//
//         alert("Map saved! You can now access it in the game menu.");
//
//         const localData = getLocalData();
//
//         if (this.props.ownMapIndex === undefined)
//             localData.personalMaps = [...localData.personalMaps, map];
//         else localData.personalMaps[this.props.ownMapIndex] = map;
//
//         setLocalData(localData);
//
//         return JSON.stringify(map);
//     }
//
//     private nextElement(element: string, delta: number) {
//         const index = EditorPage.elements.indexOf(element);
//
//         const canBeNext = (element: string) => {
//             const count = this.state.map.join().match(new RegExp(element, 'g'))?.length ?? 0;
//             const isElementNumber = !isNaN(+element);
//
//             if (isElementNumber) {
//                 return count < 2;
//             }
//
//             if (element === "S") {
//                 return count < 1;
//             }
//
//             return true;
//         }
//
//         if (index === -1) return element;
//         const sign = Math.sign(delta);
//         let next = EditorPage.elements[(index + delta + EditorPage.elements.length) % EditorPage.elements.length];
//
//         while (!canBeNext(next)) {
//             delta += sign;
//             next = EditorPage.elements[(index + delta + EditorPage.elements.length) % EditorPage.elements.length];
//         }
//
//         return next;
//     }
//
//
//
//     onLeftClick = (index: number) => {
//         const x = index % this.state.size.x;
//         const y = ~~(index / this.state.size.x);
//
//         this.state.map[y] = this.state.map[y].slice(0, x) + this.nextElement(this.state.map[y][x], 1) + this.state.map[y].slice(x + 1);
//         this.setState({map: this.state.map})
//         console.log(this.state.map);
//     }
//
//     onRightClick = (index: number) => {
//         const x = index % this.state.size.x;
//         const y = ~~(index / this.state.size.x);
//
//         this.state.map[y] = this.state.map[y].slice(0, x) + this.nextElement(this.state.map[y][x], -1) + this.state.map[y].slice(x + 1);
//         this.setState({map: this.state.map})
//     }
//
//     extendMap = (deltaX: number, deltaY: number) => {
//         if (deltaY) {
//             for (let i = 0; i < deltaY; i++) {
//                 this.state.map[this.state.map.length - 1] = "W" + " ".repeat(this.state.size.x - 2) + "W";
//                 this.state.map.push("W".repeat(this.state.size.x));
//             }
//         }
//         if (deltaX) {
//             for (let i = 0; i < this.state.size.y; i++) {
//                 this.state.map[i] = this.state.map[i].substring(0, this.state.size.x - 1)
//                 this.state.map[i] += (
//                     (i === 0 || i === this.state.size.y - 1)?"W":" "
//                 ).repeat(deltaX) + "W";
//             }
//         }
//         this.setState({
//             map: this.state.map,
//             size: {x: this.state.size.x + deltaX, y: this.state.size.y + deltaY}
//         })
//     }
//
//     reduceMap = (deltaX: number, deltaY: number) => {
//         if (this.state.size.x - deltaX < EditorPage.minSize || this.state.size.y - deltaY < EditorPage.minSize) return;
//
//         if (deltaY) {
//             for (let i = 0; i < deltaY; i++) {
//                 this.state.map.pop();
//                 this.state.map[this.state.map.length - 1] = "W".repeat(this.state.size.x);
//             }
//         }
//         if (deltaX) {
//             for (let i = 0; i < this.state.size.y; i++) {
//                 this.state.map[i] = this.state.map[i].substring(0, this.state.size.x - 1 - deltaX) + "W";
//             }
//         }
//         this.setState({
//             map: this.state.map,
//             size: {x: this.state.size.x - deltaX, y: this.state.size.y - deltaY}
//         })
//     }
//
//     render() {
//         const playerPosition = this.state.map.join("").indexOf("S");
//
//         const player = playerPosition === -1 ? {x: -1, y: -1} : {
//             x: playerPosition % this.state.size.x,
//             y: ~~(playerPosition / this.state.size.x)
//         }
//         console.log(this.state)
//
//         return (
//             <div style={
//                 {
//                     position: 'relative',
//                     "--cell-size": `min(
//                                     calc(100dvh / ${this.state.size.y}),
//                                     calc(100dvw / ${this.state.size.x})
//                                    )`,
//                 } as React.CSSProperties
//             }>
//             <MapGrid gameElements={{
//                 player,
//                 porters: filterPorters(this.state.map.join(''), this.state.size),
//                 ...filterBoxesAndTargets(this.state.map.join(''), this.state.size)
//             }}
//                      map={this.state.map.join('')}
//                      gridSize={ this.state.size }
//                      onLeftClick={this.onLeftClick}
//                      onRightClick={this.onRightClick}
//                      custom={
//                          {
//                              [this.state.size.x - 1]: (<div
//                                  className="cell flex-row" key={this.state.size.x  - 1}
//                                  style={{backgroundImage: `url(${brickWall})`,}}>
//                                  <button
//                                      className="btn-reset btn-size"
//                                      title="Reduce X"
//                                      onClick={() => this.reduceMap(1, 0)}>-</button>
//                                  <button
//                                      className="btn-reset btn-size"
//                                      title="Increase X"
//                                      onClick={() => this.extendMap(1, 0)}>+</button>
//                                  </div>),
//                              [this.state.size.x * (this.state.size.y - 1)]: (<div
//                                  className="cell flex-row" key={this.state.size.x * (this.state.size.y - 1)}
//                                  style={{backgroundImage: `url(${brickWall})`,}}>
//                                  <button
//                                      className="btn-reset btn-size"
//                                      title="Reduce Y"
//                                      onClick={() => this.reduceMap(0, 1)}>-</button>
//                                  <button
//                                      className="btn-reset btn-size"
//                                      title="Increase Y"
//                                      onClick={() => this.extendMap(0, 1)}>+</button>
//                              </div>),
//                              [this.state.size.x * this.state.size.y - 1]: (<div
//                                     className="cell flex flex-row flex-center" key={this.state.size.x * this.state.size.y - 1}
//                                     style={{backgroundImage: `url(${brickWall})`}}>
//                                  <button
//                                      className="btn-reset btn-size"
//                                      title="Save Map"
//                                      style={{
//                                          backgroundSize: "cover",
//                                          fontSize: "0"
//                                      }}
//                                      onClick={() => this.exportMap()}><Export style={{
//                                         stroke: "white",
//                                         width: "calc(var(--cell-size) / /2)",
//                                         // strokeWidth: "2em"
//                                      }}/></button>
//                                 </div>),
//                              0: (<div
//                                  title="Main Menu"
//                                  className="cell" key={0}
//                                  style={{
//                                      backgroundImage: `url(${brickWall})`,
//                                      lineHeight: 'calc(var(--cell-size))',
//                                      fontSize: 'calc(var(--cell-size) * 0.5)',
//                                      color: 'white',
//                                      paddingInlineStart: '.5em',
//                                      cursor: 'pointer',
//                                  }}
//                                  onClick={() => {
//                                      // Main Menu
//                                      if (window.confirm("Are you sure you want to go back to the main menu?\nCurrent Level progress will be lost."))
//                                          this.props.navigate('/');
//                                  }}
//                              >SukOnAn
//                              </div>)
//                          }
//                      }
//             />
//             </div>
//         );
//     }
// }
//
// export function Editor() {
//     const {mapId} = useParams();
//     const ownMapIndex = (mapId === undefined || isNaN(+mapId))?undefined:+mapId;
//     return <EditorPage navigate={useNavigate()} ownMapIndex={ownMapIndex}/>
// }

export const minSize = 5;
export const elements = " WBTS123456789"
const _defaultMap = "W".repeat(minSize) + "W   W".repeat(minSize - 2) +  "W".repeat(minSize)
export const defaultSize = {x: minSize, y: minSize}
export const defaultMap : string[] = _defaultMap.match(new RegExp(`.{1,${minSize}}`, 'g'))!


export default function() {
    const {mapId} = useParams();

    const navigate = useNavigate();

    const [state, setState] = useState<{
        map: string[],
        size: Position,
        ownMapIndex?: number
    }>({
        map: [...defaultMap],
        size: {...defaultSize},
    })

    useEffect(() => {
        const localData = getLocalData();

        const ownMapIndex = (mapId === undefined || isNaN(+mapId))?undefined:+mapId;

        const selectedMap = localData.personalMaps[ownMapIndex ?? -1];
        console.log(mapId, selectedMap)
        const map = (selectedMap === undefined) ? [...defaultMap] : [
            "W".repeat(selectedMap[0].length + 2),
            ...selectedMap.map(it => `W${it}W`),
            "W".repeat(selectedMap[0].length + 2)
        ];
        console.log(map, {x: map[0].length, y: map.length})

        setState({
            map, size: {x: map[0].length, y: map.length}, ownMapIndex
        })
    }, [mapId]);

    const exportMap = useCallback(() => {
        const map = state.map.splice(
            1, state.size.y - 2
        ).map(it => it.slice(1, state.size.x - 1))

        const localData = getLocalData();

        if (state.ownMapIndex === undefined)
            localData.personalMaps = [...localData.personalMaps, map];
        else localData.personalMaps[state.ownMapIndex] = map;

        setLocalData(localData);
        alert("Map saved! You can now access it in the game menu.");
        if (state.ownMapIndex === undefined)
            navigate(`/editor/${localData.personalMaps.length - 1}`, {replace: true})
    }, [state, navigate])

    const nextElement = useCallback((element: string, delta: number) => {
        const index = elements.indexOf(element);

        const canBeNext = (element: string) => {
            const count = state.map.join().match(new RegExp(element, 'g'))?.length ?? 0;
            const isElementNumber = !isNaN(+element);

            if (isElementNumber && element !== " ")
                return count < 2;

            if (element === "S")
                return count < 1;

            return true;
        }

        if (index === -1) return element;
        const sign = Math.sign(delta);
        let next = elements[(index + delta + elements.length) % elements.length];

        while (!canBeNext(next)) {
            delta += sign;
            next = elements[(index + delta + elements.length) % elements.length];
        }

        return next;
    }, [state])

    const onLeftClick = useCallback((index: number) => {
        const x = index % state.size.x;
        const y = ~~(index / state.size.x);
        state.map[y] = state.map[y].slice(0, x) + nextElement(state.map[y][x], 1) + state.map[y].slice(x + 1);
        setState({...state});
    }, [state, nextElement])

    const onRightClick = useCallback((index: number) => {
        const x = index % state.size.x;
        const y = ~~(index / state.size.x);
        state.map[y] = state.map[y].slice(0, x) + nextElement(state.map[y][x], -1) + state.map[y].slice(x + 1);
        setState({...state});
    }, [state, nextElement])

    const extendMap = useCallback((deltaX: number, deltaY: number) => {
        if (deltaY) {
            for (let i = 0; i < deltaY; i++) {
                state.map[state.map.length - 1] = "W" + " ".repeat(state.size.x - 2) + "W";
                state.map.push("W".repeat(state.size.x));
            }
        }
        if (deltaX) {
            for (let i = 0; i < state.size.y; i++) {
                state.map[i] = state.map[i].substring(0, state.size.x - 1)
                state.map[i] += ((i === 0 || i === state.size.y - 1)?"W":" ").repeat(deltaX) + "W";
            }
        }
        setState({
            ...state,
            map: state.map,
            size: {x: state.size.x + deltaX, y: state.size.y + deltaY}
        })
    }, [state])

    const reduceMap = useCallback((deltaX: number, deltaY: number) => {
        if (state.size.x - deltaX < minSize || state.size.y - deltaY < minSize) return;

        if (deltaY) {
            for (let i = 0; i < deltaY; i++) {
                state.map.pop();
                state.map[state.map.length - 1] = "W".repeat(state.size.x);
            }
        }
        if (deltaX) {
            for (let i = 0; i < state.size.y; i++) {
                state.map[i] = state.map[i].substring(0, state.size.x - 1 - deltaX) + "W";
            }
        }
        setState({
            ...state,
            map: state.map,
            size: {x: state.size.x - deltaX, y: state.size.y - deltaY}
        })
    }, [state])

    const playerPosition = state.map.join('').indexOf('S');

    const player = playerPosition === -1 ? {x: -1, y: -1} : {
        x: playerPosition % state.size.x,
        y: ~~(playerPosition / state.size.x)
    }

    return (
        <div key={state.ownMapIndex} style={
            {
                position: 'relative',
                "--cell-size": `min(
                                    calc(100dvh / ${state.size.y}),
                                    calc(100dvw / ${state.size.x})
                                   )`,
            } as React.CSSProperties
        }>
            <MapGrid gameElements={{
                player,
                porters: filterPorters(state.map.join(''), state.size),
                ...filterBoxesAndTargets(state.map.join(''), state.size)
            }}
                     map={state.map.join('')}
                     gridSize={ state.size }
                     onLeftClick={onLeftClick}
                     onRightClick={onRightClick}
                     custom={
                         {
                             [state.size.x - 1]: (<div
                                 className="cell flex-row" key={state.size.x  - 1}
                                 style={{backgroundImage: `url(${brickWall})`,}}>
                                 <button
                                     className="btn-reset btn-size"
                                     title="Reduce X"
                                     onClick={() => reduceMap(1, 0)}>-</button>
                                 <button
                                     className="btn-reset btn-size"
                                     title="Increase X"
                                     onClick={() => extendMap(1, 0)}>+</button>
                             </div>),
                             [state.size.x * (state.size.y - 1)]: (<div
                                 className="cell flex-row" key={state.size.x * (state.size.y - 1)}
                                 style={{backgroundImage: `url(${brickWall})`,}}>
                                 <button
                                     className="btn-reset btn-size"
                                     title="Reduce Y"
                                     onClick={() => reduceMap(0, 1)}>-</button>
                                 <button
                                     className="btn-reset btn-size"
                                     title="Increase Y"
                                     onClick={() => extendMap(0, 1)}>+</button>
                             </div>),
                             [state.size.x * state.size.y - 1]: (<div
                                 className="cell flex flex-row flex-center" key={state.size.x * state.size.y - 1}
                                 style={{backgroundImage: `url(${brickWall})`}}>
                                 <button
                                     className="btn-reset btn-size"
                                     title="Save Map"
                                     style={{
                                         backgroundSize: "cover",
                                         fontSize: "0"
                                     }}
                                     onClick={() => exportMap()}><Export style={{
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
                                         navigate('/');
                                 }}
                             >SukOnAn
                             </div>)
                         }
                     }
            />
        </div>
    );
}