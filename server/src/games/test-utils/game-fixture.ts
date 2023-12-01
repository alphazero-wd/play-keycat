import { faker } from '@faker-js/faker';
import { Game } from '@prisma/client';

export const gameFixture = (attrs?: Partial<Game>): Game => {
  return {
    ...attrs,
    id: faker.number.int({ min: 1 }),
    paragraph: faker.word.words(30),
    endedAt: faker.date.recent(),
    startedAt: faker.date.past(),
    maxPoints: faker.number.int({ min: 0 }),
    minPoints: faker.number.int({ min: 0 }),
    mode: 'CASUAL',
  };
};
