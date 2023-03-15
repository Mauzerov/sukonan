import {useState} from "react";
import {MainMenu} from "./component/MainMenu";
import {Editor} from "./component/Editor";
import Game from "./component/Game";
import {GameMenu} from "./component/GameMenu";
import {defaultKeyMap} from "./ts/KeyMap";
import {MapPicker} from "./component/MapPicker";
import {BrowserRouter, Outlet, Route, Routes, Navigate} from "react-router-dom";

export function App() {
    const [playing , setPlaying ] = useState(false);
    const [editing , setEditing ] = useState(false);
    const [learning, setLearning] = useState(false);
    const [picking , setPicking ] = useState(false);
    const [keyMap  , setKeyMap  ] = useState(defaultKeyMap);

    function reset() {
        setPlaying (false);
        setEditing (false);
        setLearning(false);
        setPicking (false);
    }
    console.log(keyMap)

    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Outlet />}>
                    <Route index element={<MainMenu />} />
                    <Route path="campaign" element={<Navigate to="/campaign/0" />}/>
                    <Route path="campaign/:mapId" element={<Game />}/>
                    <Route path="own" element={<MapPicker />} />
                    <Route path="editor" element={<Editor />} />
                    <Route path="settings" element={<GameMenu keymap={keyMap} visible={true} onKeyMapChange={(k) => setKeyMap({...k})}/>} />
                    <Route path="*" element={<div>404</div>} />
                </Route>
            </Routes>
        </BrowserRouter>
    )

    return (
        <div className="app" style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
        }
        }>
            {!playing && !editing && !learning && !picking && <MainMenu
                onPlay={() => {
                    reset(); setPlaying(true);
                }}
                onPlayLocal={() => {
                    reset(); setPicking(true);
                }}
                onEditor={() => {
                    reset(); setEditing(true);
                }}
                onSettings={() => {
                    reset(); setLearning(true);
                }}
                onCredits={() => {}} // TODO
            />}
            {playing && <Game onWin={(mapId: number) => console.log(mapId)} />}
            {picking && <MapPicker onMapSelect={(map) => {
                setPicking(false)
                console.log(map)
            }}/> }
            {editing && <Editor />}
            {learning && <GameMenu keymap={keyMap} visible={true} onKeyMapChange={(k) => setKeyMap({...k})}/>}
            {keyMap && JSON.stringify(keyMap)}
        </div>
    );
}