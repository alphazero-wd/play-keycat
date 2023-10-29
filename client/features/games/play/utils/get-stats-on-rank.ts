import { ranks } from "@/features/data";
import { getCurrentRank } from "@/features/users";

export const getStatsBasedOnRank = (averageCps: number) => {
  const currentRank = getCurrentRank(averageCps);
  return {
    wpm: ranks[currentRank].minWpm,
    acc: ranks[currentRank].minAcc,
  };
};
