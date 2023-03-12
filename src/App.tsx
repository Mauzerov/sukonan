import {useState} from "react";
import {MainMenu} from "./component/MainMenu";
import {Editor} from "./component/Editor";
import Game from "./component/Game";
import {GameMenu} from "./component/GameMenu";
import {defaultKeyMap} from "./ts/KeyMap";

export function App() {
    const [playing, setPlaying]   = useState(false);
    const [editing, setEditing]   = useState(false);
    const [learning, setLearning] = useState(false);
    const [keyMap, setKeyMap]     = useState(defaultKeyMap);

    function reset() {
        setPlaying(false);
        setEditing(false);
        setLearning(false);
    }

    return (
        <div className="app" style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
        }
        }>
            {!playing && !editing && !learning && <MainMenu
                onPlay={() => {
                    reset();
                    setPlaying(true);
                }}
                onEditor={() => {
                    reset(); setEditing(true);
                }}
                onSettings={() => {
                    reset(); setLearning(true);
                }}
                onCredits={() => {}} // TODO
            />}
            {playing && <Game />}
            {editing && <Editor />}
            {learning && <GameMenu keymap={keyMap} visible={true}/>}
        </div>
    );
}