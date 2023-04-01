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

export function withLocalData<T>(callback: (localData: LocalData) => T): T {
    const localData = getLocalData();
    const result = callback(localData);
    setLocalData(localData);
    return result;
}
