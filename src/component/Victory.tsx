import {useNavigate, Navigate} from "react-router-dom";
import {getLocalData, withLocalData} from "../ts/LocalData";
import {campaignLevels} from "../ts/const";
import "../styles/Game.scss"
import {useState} from "react";

export default function CampaignVictory() {
    const navigate = useNavigate();
    const localData = getLocalData();
    const [saved, setSaved] = useState(false);
    const [playerName, setPlayerName] = useState("");

    if (localData.reachedCampaignLevel < campaignLevels.length)
        return <Navigate to={`/campaign/${getLocalData().reachedCampaignLevel}`} replace/>;

    if (localData.reachedCampaignLevel === campaignLevels.length + 1) {
        // The user has already entered the scoreboard and saved his score
        return <Navigate to={`/`} replace />;
    }

    return (
        <div className="campaign-victory">
            <div className="campaign-victory__title">Victory!</div>
            <div className="campaign-victory__text">You have completed the campaign!</div>
            <div className="campaign-victory__score">
                <div className="campaign-victory__score-value">Your Score: <strong>{localData.currentPlayerScore.score}</strong></div>
                <div className="campaign-victory__score-player_name">
                    <input maxLength={15} spellCheck={false} disabled={saved} placeholder="Enter Your Name" onChange={(e) => setPlayerName(e.target.value)} value={playerName}/>
                    {!saved && <button onClick={() => {
                        if (playerName.replaceAll(/\S/g, "").length === playerName.length) {
                            alert("Please enter a non empty name");
                            return;
                        }

                        withLocalData((localData) => {
                            localData.scoreboard.push({
                                name: playerName,
                                score: localData.currentPlayerScore.score
                            });
                            localData.reachedCampaignLevel++; // To prevent the user from entering the scoreboard again
                        });
                        setSaved(true);
                    }}>Accept</button>}
                </div>
            </div>
            <div className="campaign-victory__buttons">
                <button className="campaign-victory__button" onClick={() => {
                    withLocalData((localData) => {
                        localData.reachedCampaignLevel = 0;
                    })
                    navigate("/campaign/0");
                }}>Play Again</button>
                <button className="campaign-victory__button" onClick={() => {
                    navigate("/");
                }}>Main Menu</button>
            </div>
        </div>
    )
}