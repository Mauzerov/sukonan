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
                            }}
                            winMessage={{
                                title: "Completed!",
                                text: (<>Congratulations! You have completed another level of the campaign.<br />You can continue playing or go back to the main menu.</>),
                                buttons: [
                                    {children: "Continue", onClick: () => {
                                        const localData = getLocalData();
                                        window.location.href = `/campaign/${localData.reachedCampaignLevel}`;
                                    }},
                                    {children: "Main Menu", onClick: () => window.location.href = "/"},
                                ]
                            }}
                        />
                    } />
                    <Route path="own" element={<MapPicker onMapSelect={map => {
                        window.location.href = `/own/${map}`;
                    }}/>} />
                    <Route path="own/:mapId" element={
                        <Game
                            mapPool={JSON.parse(localStorage.getItem('sukonan-maps')||"[]")}
                            winMessage={{
                                title: "Completed!",
                                text: (<>Congratulations! You have your own level.<br/>You can
                                    select another level or go back to the main menu.</>),
                                buttons: [
                                    {children: "Main Menu", onClick: () => window.location.href = "/"},
                                    {children: "My Maps", onClick: () => window.location.href = "/own"},
                                ],
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