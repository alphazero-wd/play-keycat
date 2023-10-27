import { getCurrentRank } from "@/features/users/utils";
import { ranks } from "@/features/shared/data";

const getWpmBasedOnRank = (averageCps: number) => {
  const currentRank = getCurrentRank(averageCps);
  return ranks[currentRank].minWpm || 20;
};

export const calculateTimeLimit = (averageCPs: number, paragraph: string) => {
  return Math.trunc(
    (paragraph.length / 5 / getWpmBasedOnRank(averageCPs)) * 60
  );
};
