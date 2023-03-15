export default interface LocalData {
    personalMaps: string[][],
    reachedCampaignLevel: number,
}

export const defaultLocalData: LocalData = {
    personalMaps: [],
    reachedCampaignLevel: 0,
}

export function getLocalData(): LocalData {
    const localData = localStorage.getItem("localData");
    if (localData) {
        return {...defaultLocalData, ...JSON.parse(localData)};
    }
    return defaultLocalData;
}

export function setLocalData(localData: LocalData) {
    localStorage.setItem("localData", JSON.stringify(localData));
}

