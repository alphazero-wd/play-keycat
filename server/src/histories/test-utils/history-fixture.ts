import { faker } from '@faker-js/faker';
import { GameHistory, Prisma } from '@prisma/client';

export const historyFixture = (
  gameId: string,
  playerId: string,
  attrs?: Partial<GameHistory>,
): GameHistory => {
  return {
    gameId,
    playerId,
    acc: new Prisma.Decimal(faker.number.float({ min: 0, max: 100 })),
    catPoints: faker.number.int({ min: -23, max: 120 }),
    wpm: faker.number.int({ min: 0, max: 200 }),
    ...attrs,
  };
};
