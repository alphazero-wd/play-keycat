import { ranks } from './ranks';

export const getCurrentRank = (catPoints: number) => {
  catPoints = Math.max(0, catPoints);
  // catPoints = 2320 -> Diamond II
  let minAbsoluteDifference = Infinity;
  let currentRank: string = 'Unranked';

  const rankEntries = Object.entries(ranks);
  rankEntries.forEach(([rank, stats]) => {
    if (
      stats.minCPs <= catPoints &&
      catPoints - stats.minCPs < minAbsoluteDifference
    ) {
      minAbsoluteDifference = catPoints - stats.minCPs;
      currentRank = rank;
    }
  });
  return currentRank;
};
