export const campaignLevels: string[][] = Array.from({length: 3}, (_, i) => {
    return require(`../maps/${i + 1}.json`);
});