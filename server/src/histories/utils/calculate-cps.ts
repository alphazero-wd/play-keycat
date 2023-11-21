import { GameMode } from '@prisma/client';
import { MAXIMUM_ACCURACY } from '../../common/constants';
import { ranks } from '../../ranks';
import { determineBasedOnMode } from '../../games/utils';

export const calculateCPs = (
  wpm: number,
  acc: number,
  position: number,
  rank: string,
) => {
  // only update CPs after ranked games
  const { maxPlayersCount } = determineBasedOnMode(GameMode.RANKED);
  const wpmPoints = wpm - ranks[rank].minWpm;
  const accPoints = acc - MAXIMUM_ACCURACY;
  const cpsEarned = wpmPoints + accPoints + 2 * (maxPlayersCount - position);
  return Math.max(+cpsEarned.toFixed(0), ranks[rank].maxCPsPenalty);
};
