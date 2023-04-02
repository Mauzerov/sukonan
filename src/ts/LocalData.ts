import {Score} from "./IGame";

export default interface LocalData {
    personalMaps: string[][],
    reachedCampaignLevel: number,
    scoreboard: {name: string, score: number}[],
    currentPlayerScore: Score,
}

export const defaultLocalData: LocalData = {
    personalMaps: [],
    reachedCampaignLevel: 0,
    scoreboard: [],
    currentPlayerScore: {
        name: "",
        score: 0
    },
}

export function getLocalData(): LocalData {
    const localData = localStorage.getItem("localData");
    if (localData) {
        return {...defaultLocalData, ...JSON.parse(localData)};
    }
    return defaultLocalData;
}

function setLocalData(localData: LocalData) {
    localStorage.setItem("localData", JSON.stringify(localData));
}

let localDataSyncTimer: any = null;
let localData: LocalData = getLocalData();

export function withLocalData<T>(callback: (localData: LocalData) => T): T {
    if (localDataSyncTimer) {
        clearTimeout(localDataSyncTimer);
    }

    localDataSyncTimer = setTimeout(() => {
        console.log("Syncing local data...")
        setLocalData(localData as LocalData);
    }, 250);

    return callback(localData);
}

window.onunload = () => {
    setLocalData(localData);
}
