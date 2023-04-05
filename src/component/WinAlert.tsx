import '../styles/WinAlert.scss'
import {WinAlertProps} from "../ts/IGame";
import {useState, useEffect} from "react";


export default function WinAlert(
    props: WinAlertProps & {map: number}
) {
    const [disabled, setDisabled] = useState(true);

    useEffect(() => {
        if (disabled) {
            setTimeout(() => {
                setDisabled(false);
            }, 250);
        }
    }, [disabled])

    return (
        <div className="win-alert">
            <div className="win-alert__title">{props.title}</div>
            {props.text && <div className="win-alert__text">{props.text}</div>}
            <div className="win-alert__buttons">
                {props.buttons.map((button, i) => (
                    <button disabled={disabled} key={i} onClick={() => {
                        if (button.onClick)
                            button.onClick(props.map);
                    }}>{button.children}</button>
                ))}
            </div>
        </div>
    )
}