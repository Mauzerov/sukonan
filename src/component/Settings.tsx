import KeyMap from "../ts/KeyMap";
import {useEffect, useState} from "react";
import "../styles/Settings.scss";

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
            <button onClick={() => setListening(!listening)}>{listening ? "[...]" : "Change"}</button>
        </div>
    );
}

export default function Settings(props: {
    keymap: KeyMap,
    onKeyMapChange?: (keymap: KeyMap) => void
}) {
    return (
        <div className="controls">
            <h1 className="title">
                Controls
            </h1>
            <div className="control-category movement">
                    <span className="control-category-title">Type</span>
                    <span className="control-category-title">Primary</span>
                    <span className="control-category-title">Secondary</span>
                    <span className="key">Move Up:&nbsp;</span>
                    {props.keymap.up.map((key, i) => (
                        <Control key={i} keyCode={key.toString()} onChange={
                            (key) => {
                                props.keymap.up[i] = key;
                                props.onKeyMapChange?.(props.keymap);
                                console.log(props.keymap)
                            }
                        }/>
                    ))}
                    <span className="key">Move Down:&nbsp;</span>
                    {props.keymap.down.map((key, i) => (
                        <Control key={i} keyCode={key.toString()} onChange={
                            (key) => {
                                props.keymap.down[i] = key;
                                props.onKeyMapChange?.(props.keymap);
                                console.log(props.keymap)
                            }
                        }/>
                    ))}
                    <span className="key">Move Left:&nbsp;</span>
                    {props.keymap.left.map((key, i) => (
                        <Control key={i} keyCode={key.toString()} onChange={
                            (key) => {
                                props.keymap.left[i] = key;
                                props.onKeyMapChange?.(props.keymap);
                                console.log(props.keymap)
                            }
                        }/>
                    ))}
                    <span className="key">Move Right:&nbsp;</span>
                    {props.keymap.right.map((key, i) => (
                        <Control key={i} keyCode={key.toString()} onChange={
                            (key) => {
                                props.keymap.right[i] = key;
                                props.onKeyMapChange?.(props.keymap);
                                console.log(props.keymap)
                            }
                        }/>
                    ))}

                <span className="key">Pause:&nbsp;</span>
                <Control keyCode={props.keymap.menu} onChange={
                    (key) => {
                        props.keymap.menu = key;
                        props.onKeyMapChange?.(props.keymap);
                        console.log(props.keymap)
                    }
                }/><div></div>
                <span className="key">Restart:&nbsp;</span>
                <Control keyCode={props.keymap.restart} onChange={
                    (key) => {
                        props.keymap.restart = key;
                        props.onKeyMapChange?.(props.keymap);
                        console.log(props.keymap)
                    }
                }/><div></div>
            </div>
        </div>
    )
}