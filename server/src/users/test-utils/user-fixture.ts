import { faker } from '@faker-js/faker';
import { User } from '@prisma/client';
import { determineXPsRequired } from '../../xps';

export const userFixture = (attrs?: Partial<User>): User => {
  const currentLevel = faker.number.int({ min: 1 });
  return {
    ...attrs,
    id: faker.number.int({ min: 1 }),
    email: faker.internet.email(),
    password: faker.internet.password(),
    catPoints: faker.number.int({ min: 0, max: 5000 }),
    currentLevel,
    inGameId: null,
    joinedAt: faker.date.past(),
    updatedAt: faker.date.recent(),
    username: faker.internet.userName(),
    xpsGained: faker.number.int({
      min: 0,
      max: determineXPsRequired(currentLevel),
    }),
  };
};
