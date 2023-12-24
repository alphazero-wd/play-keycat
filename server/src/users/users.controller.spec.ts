import { Test } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { User } from '@prisma/client';
import { userFixture } from './test-utils';
import { getCurrentRank } from '../ranks';
import { determineXPsRequired } from '../xps';
import { faker } from '@faker-js/faker';
import {
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';

describe('UsersController', () => {
  let controller: UsersController;
  let service: UsersService;
  let user: User;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: {
            findProfile: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);
    user = userFixture();
  });

  describe('getPlayerProfile', () => {
    it('should return player profile', async () => {
      const profile = {
        ...user,
        rank: getCurrentRank(user.catPoints),
        xpsRequired: determineXPsRequired(user.currentLevel),
        highestWpm: faker.number.int({ min: 0, max: 160 }),
        lastTenAverageWpm: faker.number.float({
          precision: 0.1,
          min: 0,
          max: 160,
        }),
        gamesPlayed: faker.number.int({ min: 0 }),
      };
      jest.spyOn(service, 'findProfile').mockResolvedValue(profile);

      const result = await controller.getPlayerProfile(user.username);
      expect(result).toEqual(profile);
    });

    it('should throw a not found exception if profile is not found', () => {
      jest
        .spyOn(service, 'findProfile')
        .mockRejectedValue(new NotFoundException());
      expect(controller.getPlayerProfile(user.username)).rejects.toThrowError(
        NotFoundException,
      );
    });

    it('should throw an internal server exception if something goes wrong', () => {
      jest
        .spyOn(service, 'findProfile')
        .mockRejectedValue(new InternalServerErrorException());
      expect(controller.getPlayerProfile(user.username)).rejects.toThrowError(
        InternalServerErrorException,
      );
    });
  });
});
