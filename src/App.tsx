import {useState} from "react";
import {MainMenu} from "./component/MainMenu";
import Editor from "./component/Editor";
import Game from "./component/Game";
import {saveKeyMap, getKeyMap} from "./ts/KeyMap";
import {MapPicker} from "./component/MapPicker";
import {Route, Routes, Navigate, useNavigate} from "react-router-dom";
import {campaignLevels} from "./ts/const";
import {getLocalData, withLocalData} from "./ts/LocalData";
import Settings from "./component/Settings";
import Credits from "./component/Credits";
import CampaignVictory from "./component/Victory";
import Scoreboard from "./component/Scoreboard";

export function App() {
    const [keyMap, setKeyMap] = useState(getKeyMap);
    const localData = getLocalData();

    const navigate = useNavigate();

    return (
        <>
            <Routes>
                <Route path="/" index element={<MainMenu />} />
                <Route path="/campaign" element={<Navigate to="/campaign/0" replace/>}/>
                <Route path="/campaign/victory" element={<CampaignVictory />}/>
                <Route path="/campaign/:mapId" element={
                    <Game
                        keymap={keyMap}
                        mapPool={campaignLevels}
                        onWin={(current) => {
                            withLocalData((localData) => {
                                if (localData.reachedCampaignLevel <= current)
                                    localData.reachedCampaignLevel = current + 1;
                            })
                        }}
                        onMove={(delta: number) => {
                            console.assert(delta >= 0)
                            return withLocalData((localData) => {
                                localData.currentPlayerScore.score += delta;
                            })
                        }}
                        winMessage={{
                            title: "Completed!",
                            text: (<>Congratulations! You have completed another level of the campaign.<br />You can continue playing or go back to the main menu.</>),
                            buttons: [
                                {children: "Continue",  onClick: (map: number) => {
                                    navigate(`/campaign/${map + 1}`);
                                }},
                                {children: "Main Menu", onClick: () => { navigate("/"); }},
                            ]
                        }}
                        conditions={[
                            {func: (mapId) => {
                                return localData.reachedCampaignLevel < mapId
                            }, element: (<Navigate to={`/campaign/${localData.reachedCampaignLevel}`} replace/>)},
                            {func: (mapId) => {
                                    return mapId >= campaignLevels.length
                                }, element: (<Navigate to={`/campaign/victory`} replace/>)}
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
                <Route path="/scoreboard" element={<Scoreboard scores={getLocalData().scoreboard}/>} />
                <Route path="/*" element={<div>404</div>} />
            </Routes>
        </>
    )
}
