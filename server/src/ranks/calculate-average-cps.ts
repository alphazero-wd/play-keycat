import { User } from '@prisma/client';

export const calculateAverageCPs = (players: User[]) => {
  const sumCPs = players.reduce((sum, player) => sum + player.catPoints, 0);
  return +(sumCPs / players.length).toFixed(0);
};
