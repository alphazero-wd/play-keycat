import { MAX_PLAYERS_COUNT } from '../../common/constants';

export const calculateCPs = (wpm: number, acc: number, position: number) => {
  const score = wpm + acc + 2 * (MAX_PLAYERS_COUNT - position);
  return +score.toFixed(0);
};
