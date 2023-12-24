import { faker } from '@faker-js/faker';
import { User } from '@prisma/client';
import { v4 } from 'uuid';

export const userFixture = (attrs?: Partial<User>): User => {
  return {
    id: v4(),
    email: faker.internet.email(),
    password: faker.internet.password(),
    catPoints: 1000,
    currentLevel: 1,
    inGameId: null,
    joinedAt: faker.date.past(),
    updatedAt: faker.date.recent(),
    username: faker.internet.userName(),
    xpsGained: 0,
    ...attrs,
  };
};
