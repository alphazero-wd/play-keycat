import { PlayerFinishedDto } from '../../games/dto';

export const calculateXPs = (
  { wpm, acc, position }: Omit<PlayerFinishedDto, 'gameId'>,
  paragraph: string,
) => {
  return Math.round((wpm * acc * paragraph.length) / (position * 5 * 10 ** 3));
};
