import {useState} from "react";
import {MainMenu} from "./component/MainMenu";
import {Editor} from "./component/Editor";
import Game from "./component/Game";
import {GameMenu} from "./component/GameMenu";
import {defaultKeyMap} from "./ts/KeyMap";
import {MapPicker} from "./component/MapPicker";
import {HashRouter, Outlet, Route, Routes, Navigate, useNavigate} from "react-router-dom";
import {campaignLevels} from "./ts/const";
import {getLocalData, setLocalData} from "./ts/LocalData";

export function App() {
    const [keyMap, setKeyMap] = useState(defaultKeyMap);

    const navigate = useNavigate();

    return (
        <>
            <Routes>
                <Route path="/">
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
                                    {children: "Continue",  onClick: () => {
                                        const localData = getLocalData();
                                        navigate(`/campaign/${localData.reachedCampaignLevel}`);
                                    }},
                                    {children: "Main Menu", onClick: () => navigate("/")},
                                ]
                            }}
                        />
                    } />
                    <Route path="own" element={<MapPicker onMapSelect={map => {
                        navigate(`/own/${map}`)
                    }}/>} />
                    <Route path="own/:mapId" element={
                        <Game
                            mapPool={JSON.parse(localStorage.getItem('sukonan-maps')||"[]")}
                            winMessage={{
                                title: "Completed!",
                                text: (<>Congratulations! You have completed your own level.<br/>You can
                                    select another level or go back to the main menu.</>),
                                buttons: [
                                    {children: "Main Menu", onClick: () => navigate("/")},
                                    {children: "My Maps",   onClick: () => navigate("/own")},
                                ],
                            }}
                        />
                    } />
                    <Route path="editor" element={<Editor />} />
                    <Route path="settings" element={<GameMenu keymap={keyMap} visible={true} onKeyMapChange={(k) => setKeyMap({...k})}/>} />
                    <Route path="*" element={<div>404</div>} />
                </Route>
            </Routes>
        </>
    )
}
