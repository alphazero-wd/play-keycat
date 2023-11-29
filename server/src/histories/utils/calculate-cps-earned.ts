import { GameMode } from '@prisma/client';
import { determineMaxPlayersCount } from '../../games/utils';
import { ranks } from '../../ranks';

const MAXIMUM_ACCURACY = 100;
export const calculateCPsEarned = (
  wpm: number,
  acc: number,
  position: number,
  rank: string,
) => {
  // only update CPs after ranked games
  const maxPlayersCount = determineMaxPlayersCount(GameMode.RANKED);
  const wpmPoints = wpm - ranks[rank].minWpm;
  const accPoints = acc - MAXIMUM_ACCURACY;
  const cpsEarned = wpmPoints + accPoints + 2 * (maxPlayersCount - position);
  return Math.max(+cpsEarned.toFixed(0), ranks[rank].maxCPsPenalty);
};
