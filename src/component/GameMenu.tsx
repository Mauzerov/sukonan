import "../styles/GameMenu.scss"
import KeyMap from "../ts/KeyMap";
import {useEffect, useState} from "react";

function Control(props: { keyCode: string, onChange: (key: string) => void }) {
    const [listening, setListening] = useState(false);

    useEffect(() => {
        if(listening) {
            const listener = (e: KeyboardEvent) => {
                props.onChange(e.code);
                setListening(false);
            }
            window.addEventListener("keydown", listener);
            return () => {
                window.removeEventListener("keydown", listener);
            }
        }
    });

    return (
        <div className="key-change">
            <span className="key">{props.keyCode}</span>
            <button onClick={() => setListening(!listening)}>{listening ? "Listening..." : "Change"}</button>
        </div>
    );
}

export function GameMenu(props : {
    visible: boolean,
    keymap: KeyMap,
    onKeyMapChange?: (keymap: KeyMap) => void
}) {
    return (
        <div className="game-menu" style={{
            display: props.visible ? "block" : "none"
        }}>
            <div className="controls">
                <h1 className="title">
                    Controls
                </h1>
                <div className="control">
                    <span className="key">Move Up:&nbsp;</span>
                    {props.keymap.up.map((key, i) => (
                        <Control key={i} keyCode={key.toString()} onChange={
                            (key) => {
                                props.keymap.up[i] = key;
                                props.onKeyMapChange?.(props.keymap);
                            }
                        }/>
                    ))}
                </div>
                <div className="control">
                    <span className="key">Move Down:&nbsp;</span>
                    {props.keymap.down.map((key, i) => (
                        <Control key={i} keyCode={key.toString()} onChange={
                            (key) => {
                                props.keymap.down[i] = key;
                                props.onKeyMapChange?.(props.keymap);
                            }
                        }/>
                    ))}
                </div>
            </div>

            <h1>Credits</h1>
            <p>Created by <a href="https://github.com/Mauzerov" target="_blank" rel="noreferrer">Mateusz Mazurek</a></p>
            <p>man pulling cart by Vectors Point from
                <a href="https://thenounproject.com/browse/icons/term/man-pulling-cart/" target="_blank" title="man pulling cart Icons" rel="noreferrer">Noun Project</a>
            </p>
            <p>Game Icons <a href="https://www.svgrepo.com" target="_blank" rel="noreferrer">SvgRepo</a><br />
                <ul>
                    <li>Help Icon: @HashiCorp</li>
                    <li>Restart Icon: @Ionicons</li>
                    <li>Teleporter Spiral Icon: @game-icons.net</li>
                </ul>
            </p>
        </div>
    );
}