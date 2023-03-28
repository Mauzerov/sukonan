import React, {useCallback, useEffect, useState} from "react";
import {MapGrid} from "./MapGrid";
import {Position} from "../ts/IGame";
import brickWall from "../svg/brick-wall.svg";
import { ReactComponent as Export} from "../svg/save.svg";
import { ReactComponent as New} from "../svg/group-1.svg";
import { ReactComponent as Clear} from "../svg/grid-eraser.svg";
import {filterBoxesAndTargets, filterPorters} from "../util/GameUtil";
import {useNavigate, useParams} from "react-router-dom";
import {getLocalData, withLocalData} from "../ts/LocalData";


export const minSize = 5;
export const elements = " WBTS123456789"
const _defaultMap = "W".repeat(minSize) + "W   W".repeat(minSize - 2) +  "W".repeat(minSize)
export const defaultSize = {x: minSize, y: minSize}
export const defaultMap : string[] = _defaultMap.match(new RegExp(`.{1,${minSize}}`, 'g'))!


export default function Editor() {
    const {mapId} = useParams();
    const navigate = useNavigate();
    console.log("render")
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
        const map = state.map.slice(
            1, state.size.y - 1
        ).map(it => it.slice(1, state.size.x - 1))
        withLocalData((localData) => {
            if (state.ownMapIndex === undefined)
                localData.personalMaps = [...localData.personalMaps, map];
            else localData.personalMaps[state.ownMapIndex] = map;
        })

        alert("Map saved! You can now access it in the game menu.");
        if (state.ownMapIndex === undefined)
            navigate(`/editor/${getLocalData().personalMaps.length - 1}`)
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

    const shuffleCell = useCallback((index: number, delta: number) => {
        const x = index % state.size.x;
        const y = ~~(index / state.size.x);
        state.map[y] = state.map[y].slice(0, x) + nextElement(state.map[y][x], delta) + state.map[y].slice(x + 1);
        setState({...state});
    }, [state, nextElement])

    const onLeftClick  = (index: number) => shuffleCell(index, 1);
    const onRightClick = (index: number) => shuffleCell(index, -1);

    const resizeMap = useCallback((deltaX: number, deltaY: number) => {
        if (state.size.x + deltaX < minSize || state.size.y + deltaY < minSize) return;
        let map = [...state.map];

        if (deltaX > 0) {
            map[0] = map[state.size.y - 1] = "W".repeat(state.size.x + deltaX)
            for (let i = 1; i < state.size.y - 1; i++) {
                map[i] = map[i].slice(0, -1);
                map[i] += " ".repeat(deltaX) + 'W';
            }
        }
        else if (deltaX < 0) {
            for (let i = 0; i < state.size.y; i++) {
                map[i] = map[i].substring(0, state.size.x + deltaX - 1) + "W";
            }
        }

        if (deltaY > 0) {
            for (let i = 0; i < deltaY; i++) {
                map[map.length - 1] = "W" + " ".repeat(state.size.x - 2) + "W";
                map.push("W".repeat(state.size.x));
            }
        }
        else if (deltaY < 0) {
            map = map.slice(0, state.size.y + deltaY);
            map[map.length - 1] = "W".repeat(state.size.x);
        }
        console.log('Set State')
        setState({
            ...state,
            map: [...map],
            size: {x: map[0].length, y: map.length}
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
                                     onClick={() => resizeMap(-1, 0)}>-</button>
                                 <button
                                     className="btn-reset btn-size"
                                     title="Increase X"
                                     onClick={() => resizeMap(1, 0)}>+</button>
                             </div>),
                             [state.size.x * (state.size.y - 1)]: (<div
                                 className="cell flex-row" key={state.size.x * (state.size.y - 1)}
                                 style={{backgroundImage: `url(${brickWall})`,}}>
                                 <button
                                     className="btn-reset btn-size"
                                     title="Reduce Y"
                                     onClick={() => resizeMap(0, -1)}>-</button>
                                 <button
                                     className="btn-reset btn-size"
                                     title="Increase Y"
                                     onClick={() => resizeMap(0, 1)}>+</button>
                             </div>),
                             [state.size.x * state.size.y - 1]: (<div
                                 className="cell flex flex-row flex-center" key={state.size.x * state.size.y - 1}
                                 style={{backgroundImage: `url(${brickWall})`}}>
                                 <button
                                     className="btn-reset btn-size"
                                     title="Save Map"
                                     style={{
                                         backgroundSize: "cover",
                                         fontSize: "0" // centers the icon
                                     }}
                                     onClick={() => exportMap()}><Export style={{
                                     stroke: "white",
                                     width: "calc(var(--cell-size) / 2)",
                                 }}/></button>
                             </div>),
                             [state.size.x * state.size.y - 2]: (<div
                                 className="cell flex flex-row flex-center" key={state.size.x * state.size.y - 2}
                                 style={{backgroundImage: `url(${brickWall})`}}>
                                 <button
                                     className="btn-reset btn-size"
                                     title="Clear Map"
                                     style={{
                                         backgroundSize: "cover",
                                         fontSize: "0" // centers the icon
                                     }}
                                     onClick={() => {
                                         setState({
                                            ...state,
                                            map: state.map.map(row => row.replace(/[^W]/g, ' '))
                                         })
                                     }}><Clear style={{
                                     stroke: "white",
                                     width: "calc(var(--cell-size) / 2)",
                                 }}/></button>
                             </div>),
                             [state.size.x * state.size.y - 3]: (<div
                                 className="cell flex flex-row flex-center" key={state.size.x * state.size.y - 3}
                                 style={{backgroundImage: `url(${brickWall})`}}>
                                 <button
                                     className="btn-reset btn-size"
                                     title="New Map"
                                     style={{
                                         backgroundSize: "cover",
                                         fontSize: "0" // centers the icon
                                     }}
                                     onClick={() => navigate("/editor")}><New style={{
                                     stroke: "white",
                                     width: "calc(var(--cell-size) / 2)",
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