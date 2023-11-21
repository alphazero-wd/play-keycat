import { GameMode } from '@prisma/client';

export const determineBasedOnMode = (mode: GameMode) => {
  if (mode !== GameMode.PRACTICE) return { maxPlayersCount: 2, countdown: 10 };
  return { maxPlayersCount: 1, countdown: 3 };
};
