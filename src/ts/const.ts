export const campaignLevels: string[][] = Array.from({length: 9}, (_, i) => {
    return require(`../maps/${i}.json`) as string[];
});