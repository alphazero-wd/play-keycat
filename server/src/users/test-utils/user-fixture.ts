import { faker } from '@faker-js/faker';
import { User } from '@prisma/client';
import { determineXPsRequired } from '../../xps';
import { v4 } from 'uuid';

export const userFixture = (attrs?: Partial<User>): User => {
  const currentLevel = faker.number.int({ min: 1 });
  return {
    id: v4(),
    email: faker.internet.email(),
    password: faker.internet.password(),
    catPoints: faker.number.int({ min: 1000, max: 3000 }),
    currentLevel,
    inGameId: null,
    joinedAt: faker.date.past(),
    updatedAt: faker.date.recent(),
    username: faker.internet.userName(),
    xpsGained: faker.number.int({
      min: 0,
      max: determineXPsRequired(currentLevel) - 1,
    }),
    ...attrs,
  };
};
