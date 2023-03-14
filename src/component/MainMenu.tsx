import '../styles/MainMenu.scss'
import {Link} from "react-router-dom";

export function MainMenu(props: {
    onPlay?: () => void,
    onPlayLocal?: () => void,
    onEditor?: () => void,
    onSettings?: () => void,
    onCredits?: () => void,
}) {
    const campaignLevel = localStorage.getItem('sukonan-campaign-level');
    const canContinue = campaignLevel !== null;

    return (
        <div className="main-menu">
            <div className="main-menu__title">SukOnAn</div>
            <div className="main-menu__buttons">
                {canContinue &&
                <Link to={`/campaign/maps/` + campaignLevel} className="main-menu__button">Continue</Link>}
                <Link to={"/campaign"} tabIndex={1} className="main-menu__button">Start {canContinue?"Over":""}</Link>
                <Link to={"/own"} tabIndex={2} className="main-menu__button">My Maps</Link>
                <Link to={"/editor"} tabIndex={3} className="main-menu__button">Editor</Link>
                <Link to={"/settings"} tabIndex={4} className="main-menu__button">Settings</Link>
                <Link to={"/credits"} tabIndex={5} className="main-menu__button">Credits</Link>
            </div>
        </div>
    )
}