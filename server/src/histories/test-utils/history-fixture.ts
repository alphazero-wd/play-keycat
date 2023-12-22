import { GameHistory, Prisma } from '@prisma/client';

export const historyFixture = (
  gameId: string,
  playerId: string,
  attrs?: Partial<GameHistory>,
): GameHistory => {
  return {
    gameId,
    playerId,
    acc: new Prisma.Decimal(95),
    catPoints: 10,
    wpm: 40,
    ...attrs,
  };
};
