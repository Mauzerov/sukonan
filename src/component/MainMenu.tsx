import '../styles/MainMenu.scss'

export function MainMenu(props: {
    onPlay: () => void,
    onEditor: () => void,
    onSettings: () => void,
    onCredits: () => void,
}) {
    return (
        <div className="main-menu">
            <div className="main-menu__title">SukOnAn</div>
            <div className="main-menu__buttons">
                <div tabIndex={1} className="main-menu__button" onClick={props.onPlay}>Campaign</div>
                <div tabIndex={2} className="main-menu__button" onClick={props.onPlay}>My Maps</div>
                <div tabIndex={3} className="main-menu__button" onClick={props.onEditor}>Editor</div>
                <div tabIndex={4} className="main-menu__button" onClick={props.onSettings}>Settings</div>
                <div tabIndex={5} className="main-menu__button" onClick={props.onCredits}>Credits</div>
            </div>
        </div>
    )
}