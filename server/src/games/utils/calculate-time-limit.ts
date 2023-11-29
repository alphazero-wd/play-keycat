import { getCurrentRank, ranks } from '../../ranks';

const getAverageWPM = (averageCPs: number) => {
  const currentRank = getCurrentRank(averageCPs);
  return ranks[currentRank].minWpm;
};

export const calculateTimeLimit = (averageCPs: number, paragraph: string) => {
  return Math.trunc((paragraph.length / 5 / getAverageWPM(averageCPs)) * 60);
};
