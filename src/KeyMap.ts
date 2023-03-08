export default interface KeyMap {
    up: string[],
    down: string[],
    left: string[],
    right: string[],
    restart: string,
    menu: string,
}

export const defaultKeyMap: KeyMap = {
    up: ['ArrowUp', 'KeyW'],
    down: ['ArrowDown', 'KeyS'],
    left: ['ArrowLeft', 'KeyA'],
    right: ['ArrowRight', 'KeyD'],
    restart: 'KeyR',
    menu: 'Escape',
}