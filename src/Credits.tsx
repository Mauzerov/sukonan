export function Credits(props : { visible: boolean }) {
    return (
        <div className="credits" style={{
            display: props.visible ? "block" : "none"
        }}>
            <h1>Credits</h1>
            <p>Created by <a href="https://github.com/Mauzerov" target="_blank">Mateusz Mazurek</a></p>
            <p>man pulling cart by Vectors Point from <a href="https://thenounproject.com/browse/icons/term/man-pulling-cart/" target="_blank" title="man pulling cart Icons">Noun Project</a></p>
            <p>Game Icons <a href="https://www.svgrepo.com" target="_blank">SvgRepo</a><br />
                <ul>
                    <li>Help Icon: @HashiCorp</li>
                    <li>Restart Icon: @Ionicons</li>
                </ul>
            </p>
        </div>
    );
}