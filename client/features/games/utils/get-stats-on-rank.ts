import { ranks } from "@/features/shared/data";
import { getCurrentRank } from "@/features/users/utils";

export const getStatsBasedOnRank = (averageCps: number) => {
  const currentRank = getCurrentRank(averageCps);
  return {
    wpm: ranks[currentRank].minWpm,
    acc: ranks[currentRank].minAcc,
  };
};
