import '../styles/MainMenu.scss'
import {Link} from "react-router-dom";
import {getLocalData, withLocalData} from "../ts/LocalData";

export function MainMenu() {
    const campaignLevel = getLocalData()
    const canContinue = campaignLevel.reachedCampaignLevel > 0;

    return (
        <div className="main-menu">
            <div className="main-menu__title">SukOnAn</div>
            <div className="main-menu__buttons">
                {canContinue &&
                <Link to={`/campaign/` + campaignLevel.reachedCampaignLevel} className="main-menu__button">Continue</Link>}
                <Link to={"/campaign"} tabIndex={1} className="main-menu__button" onClick={(e) => {
                    if (canContinue && !window.confirm("Are you sure you want to start a new game? All progress will be lost.")) {
                        return e.preventDefault(); // prevent navigation
                    }
                    withLocalData((localData) => {
                        localData.reachedCampaignLevel = 0;
                    })
                }
                }>Start {canContinue?"Over":""}</Link>
                <Link to={"/own"} tabIndex={2} className="main-menu__button">My Maps</Link>
                <Link to={"/editor"} tabIndex={3} className="main-menu__button">Editor</Link>
                <Link to={"/settings"} tabIndex={4} className="main-menu__button">Settings</Link>
                <Link to={"/credits"} tabIndex={5} className="main-menu__button">Credits</Link>
            </div>
        </div>
    )
}