import React, {useCallback, useEffect, useState} from "react";
import {MapGrid} from "./MapGrid";
import {Position} from "../ts/IGame";
import brickWall from "../svg/brick-wall.svg";
import { ReactComponent as Export} from "../svg/save.svg";
import {filterBoxesAndTargets, filterPorters} from "../util/GameUtil";
import {useNavigate, useParams} from "react-router-dom";
import {getLocalData, setLocalData} from "../ts/LocalData";


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