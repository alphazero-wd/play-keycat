/*
  Unranked:
    - Min CPs: 0
    - Min WPM: 0
    - Min ACC: 50

  Bronze IV:
    - Min CPs: 500
    - Min WPM: 40
    - Min ACC: 55
*/

import { ranks } from "@/features/shared/data";

export const getCurrentRank = (catPoints: number) => {
  // catPoints = 2320 -> Diamond II
  let minAbsoluteDifference = Infinity;
  let currentRank: string = "Unranked";

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
