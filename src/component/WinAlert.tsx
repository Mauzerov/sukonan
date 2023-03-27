import '../styles/WinAlert.scss'
import {WinAlertProps} from "../ts/IGame";


export default function WinAlert(
    props: WinAlertProps
) {
    return (
        <div className="win-alert">
            <div className="win-alert__title">{props.title}</div>
            {props.text && <div className="win-alert__text">{props.text}</div>}
            <div className="win-alert__buttons">
                {props.buttons.map((button, i) => (
                    <button key={i} {...button}>{button.children}</button>
                ))}
            </div>
        </div>
    )
}