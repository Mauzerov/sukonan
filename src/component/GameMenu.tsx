import "../styles/GameMenu.scss"
import KeyMap from "../ts/KeyMap";
import React, {useEffect, useState} from "react";
import Settings from "./Settings";
import Credits from "./Credits";

export function GameMenu(props : {
    visible: boolean,
    keymap: KeyMap,
    onKeyMapChange?: (keymap: KeyMap) => void
}) {
    return (
        <div className="game-menu" style={{
            display: props.visible ? "block" : "none"
        }}>
            <Settings keymap={props.keymap} onKeyMapChange={props.onKeyMapChange}/>

            <Credits />
        </div>
    );
}