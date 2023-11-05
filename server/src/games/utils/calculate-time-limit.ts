import { getCurrentRank, ranks } from '../../ranks';

const getWpmBasedOnRank = (averageCps: number) => {
  const currentRank = getCurrentRank(averageCps);
  return ranks[currentRank].minWpm;
};

export const calculateTimeLimit = (averageCPs: number, paragraph: string) => {
  return Math.trunc(
    (paragraph.length / 5 / getWpmBasedOnRank(averageCPs)) * 60,
  );
};
