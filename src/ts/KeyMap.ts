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

export function getKeyMap(): KeyMap {
    const localKeymap = localStorage.getItem("keymap");
    if (localKeymap) {
        return {...defaultKeyMap, ...JSON.parse(localKeymap)}
    }
    return defaultKeyMap;
}

export function saveKeyMap(keyMap: KeyMap) {
    localStorage.setItem("keymap", JSON.stringify(keyMap));
}