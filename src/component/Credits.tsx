import React from "react";
import "../styles/Credits.scss"

export default function Credits() {
    return (
        <div className="credits">
            <h1 className="title">Credits</h1>
            <div className="author">Created by <a href="https://github.com/Mauzerov" target="_blank" rel="noreferrer">Mateusz Mazurek</a></div>
            <div className="icons svg-repo">Icons from <a href="https://www.svgrepo.com" target="_blank" rel="noreferrer">SvgRepo</a>:
                <ul>
                    <li>Help Icon: @HashiCorp</li>
                    <li>Restart Icon: @Ionicons</li>
                    <li>Teleporter Spiral Icon: @game-icons.net</li>
                    <li>Save Icon: @Ananthanath A X Kalaiism</li>
                    <li>Trashcan: @brankic1979</li>
                </ul>
            </div>
        </div>
    )
}