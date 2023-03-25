import {useState} from "react";
import {MainMenu} from "./component/MainMenu";
import Editor from "./component/Editor";
import Game from "./component/Game";
import {defaultKeyMap, saveKeyMap, getKeyMap} from "./ts/KeyMap";
import {MapPicker} from "./component/MapPicker";
import {HashRouter, Outlet, Route, Routes, Navigate, useNavigate} from "react-router-dom";
import {campaignLevels} from "./ts/const";
import {getLocalData, setLocalData} from "./ts/LocalData";
import Settings from "./component/Settings";
import Credits from "./component/Credits";

export function App() {
    const [keyMap, setKeyMap] = useState(getKeyMap);
    const localData = getLocalData();

    const navigate = useNavigate();

    return (
        <>
            <Routes>
                <Route path="/" index element={<MainMenu />} />
                <Route path="/campaign" element={<Navigate to="/campaign/0" replace/>}/>
                <Route path="/campaign/:mapId" element={
                    <Game
                        keymap={keyMap}
                        mapPool={campaignLevels}
                        onWin={(current) => {
                            setLocalData({...getLocalData(), reachedCampaignLevel: current + 1});
                        }}
                        winMessage={{
                            title: "Completed!",
                            text: (<>Congratulations! You have completed another level of the campaign.<br />You can continue playing or go back to the main menu.</>),
                            buttons: [
                                {children: "Continue",  onClick: () => {
                                    const localData = getLocalData();
                                    navigate(`/campaign/${localData.reachedCampaignLevel}`);
                                }},
                                {children: "Main Menu", onClick: () => { navigate("/"); }},
                            ]
                        }}
                        conditions={[
                            {func: (mapId) => {
                                return localData.reachedCampaignLevel < mapId
                            }, element: (<Navigate to={`/campaign/${localData.reachedCampaignLevel}`} replace/>)}
                        ]}
                    />
                } />
                <Route path="/own" element={<MapPicker />} />
                <Route path="/own/:mapId" element={
                    <Game
                        keymap={keyMap}
                        mapPool={getLocalData().personalMaps}
                        winMessage={{
                            title: "Completed!",
                            text: (<>Congratulations! You have completed your own level.<br/>You can
                                select another level or go back to the main menu.</>),
                            buttons: [
                                {children: "Main Menu", onClick: () => { navigate("/"); }},
                                {children: "My Maps",   onClick: () => { navigate("/own"); }},
                            ],
                        }}
                    />
                } />
                <Route path="/editor" element={<Editor />}/>
                <Route path="/editor/:mapId" element={<Editor />}/>
                <Route path="/settings" element={<Settings
                    keymap={keyMap}
                    onKeyMapChange={(k) => { setKeyMap({...k}); saveKeyMap(k); }}/>} />
                <Route path="/credits" element={<Credits/>} />
                <Route path="/*" element={<div>404</div>} />
            </Routes>
        </>
    )
}
