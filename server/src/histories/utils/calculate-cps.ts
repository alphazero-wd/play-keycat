import { MAX_PLAYERS_COUNT } from '../../common/constants';
import { ranks } from '../../ranks';

export const calculateCPs = (
  wpm: number,
  acc: number,
  position: number,
  rank: string,
) => {
  const wpmPoints = wpm - ranks[rank].minWpm;
  const accPoints = acc - ranks[rank].minAcc;
  const cpsEarned = wpmPoints + accPoints + 2 * (MAX_PLAYERS_COUNT - position);
  return Math.max(+cpsEarned.toFixed(0), ranks[rank].maxCPsPenalty);
};
