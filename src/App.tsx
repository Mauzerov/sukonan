import {useState} from "react";
import {MainMenu} from "./component/MainMenu";
import {Editor} from "./component/Editor";
import Game from "./component/Game";
import {GameMenu} from "./component/GameMenu";
import {defaultKeyMap} from "./ts/KeyMap";
import {MapPicker} from "./component/MapPicker";
import {BrowserRouter, Outlet, Route, Routes, Navigate, useNavigate} from "react-router-dom";
import {campaignLevels} from "./ts/const";
import {getLocalData, setLocalData} from "./ts/LocalData";

export function App() {
    const [keyMap, setKeyMap] = useState(defaultKeyMap);
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Outlet />}>
                    <Route index element={<MainMenu />} />
                    <Route path="campaign" element={<Navigate to="/campaign/0" replace/>}/>
                    <Route path="campaign/:mapId" element={
                        <Game
                            mapPool={campaignLevels}
                            onWin={(current) => {
                                setLocalData({...getLocalData(), reachedCampaignLevel: current + 1});
                                window.location.href = `/campaign/${current + 1}`;
                            }}
                        />
                    } />
                    <Route path="own" element={<MapPicker onMapSelect={map => {
                        window.location.href = `/own/${map}`;
                    }}/>} />
                    <Route path="own/:mapId" element={
                        <Game
                            mapPool={JSON.parse(localStorage.getItem('sukonan-maps')||"[]")}
                            onWin={(current) => {
                                alert("You won! :D")
                            }}
                        />
                    } />
                    <Route path="editor" element={<Editor />} />
                    <Route path="settings" element={<GameMenu keymap={keyMap} visible={true} onKeyMapChange={(k) => setKeyMap({...k})}/>} />
                    <Route path="*" element={<div>404</div>} />
                </Route>
            </Routes>
        </BrowserRouter>
    )
}