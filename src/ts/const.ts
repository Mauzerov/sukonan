export const campaignLevels: string[][] = Array.from({length: 3}, (_, i) => i + 1).map((i) => {
    return require(`../maps/${i}.json`);
});