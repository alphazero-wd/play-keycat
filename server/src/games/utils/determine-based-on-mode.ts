import { GameMode } from '@prisma/client';

export const determineMaxPlayersCount = (mode: GameMode) => {
  return mode !== GameMode.PRACTICE ? 2 : 1;
};

export const determineCountdown = (mode: GameMode) => {
  return mode === GameMode.PRACTICE ? 3 : 10;
};
