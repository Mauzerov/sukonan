import {Score} from "../ts/IGame";
import "../styles/Scoreboard.scss";

function ScoreElement(score: Score) {
    return (
        <tr>
            <td></td>
            <td>{score.name}</td>
            <td>{score.score}</td>
        </tr>
    )
}

export default function Scoreboard(props: {
    scores: Score[]
}) {
    return (
        <div className="scoreboard">
            <h1 className="title">Scoreboard</h1>
            <div className="scoreboard__table">
                <table>
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Player</th>
                            <th>Moves</th>
                        </tr>
                    </thead>
                    <tbody>
                        {props.scores.sort((a, b) => a.score - b.score).map(
                            (score, index) =>
                                <ScoreElement key={index} {...score} />
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}