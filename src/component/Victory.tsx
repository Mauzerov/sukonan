import {useNavigate, Navigate} from "react-router-dom";
import {getLocalData, withLocalData} from "../ts/LocalData";
import {campaignLevels} from "../ts/const";
import "../styles/Game.scss"

export default function CampaignVictory() {
    const navigate = useNavigate();

    if (getLocalData().reachedCampaignLevel < campaignLevels.length)
        return <Navigate to={`/campaign/${getLocalData().reachedCampaignLevel}`} replace/>;

    return (
        <div className="campaign-victory">
            <div className="campaign-victory__title">Victory!</div>
            <div className="campaign-victory__text">You have completed the campaign!</div>
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