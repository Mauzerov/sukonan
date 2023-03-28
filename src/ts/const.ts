export const campaignLevels: string[][] = Array.from({length: 8}, (_, i) => {
    return require(`../maps/${i + 1}.json`);
});