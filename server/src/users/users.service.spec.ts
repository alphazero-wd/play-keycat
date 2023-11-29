import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, User } from '@prisma/client';
import { userFixture } from './test-utils';
import { PrismaError } from '../prisma/prisma-error';
import { getCurrentRank } from '../ranks';
import { determineXPsRequired } from '../xps';
import { faker } from '@faker-js/faker';

describe('UsersService', () => {
  let service: UsersService;
  let prisma: PrismaService;
  let user: User;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              create: jest.fn(),
              findUniqueOrThrow: jest.fn(),
              update: jest.fn(),
            },
            gameHistory: {
              aggregate: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    prisma = module.get<PrismaService>(PrismaService);
    user = userFixture();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createUser', () => {
    it('should create a user', async () => {
      jest.spyOn(prisma.user, 'create').mockResolvedValue(user);
      const result = await service.create({
        username: user.username,
        email: user.email,
        password: user.password,
      });

      expect(result).toEqual(user);
    });

    it('should throw an error if username exists', async () => {
      jest
        .spyOn(prisma.user, 'create')
        .mockRejectedValue(
          new Prisma.PrismaClientKnownRequestError(
            'ERROR: duplicate key value violates unique constraint "username"',
            { clientVersion: '5.0', code: PrismaError.UniqueViolation },
          ),
        );
      expect(
        service.create({
          username: user.username,
          email: user.email,
          password: user.password,
        }),
      ).rejects.toThrowError('User with that username already exists');
    });

    it('should throw an error if email exists', async () => {
      jest
        .spyOn(prisma.user, 'create')
        .mockRejectedValue(
          new Prisma.PrismaClientKnownRequestError(
            'ERROR: duplicate key value violates unique constraint "email"',
            { clientVersion: '5.0', code: PrismaError.UniqueViolation },
          ),
        );
      expect(
        service.create({
          username: user.username,
          email: user.email,
          password: user.password,
        }),
      ).rejects.toThrowError('User with that email already exists');
    });

    it('should throw an internal server error if other error is thrown', async () => {
      jest.spyOn(prisma.user, 'create').mockRejectedValue('some error');
      expect(
        service.create({
          username: user.username,
          email: user.email,
          password: user.password,
        }),
      ).rejects.toThrowError('Something went wrong');
    });
  });

  describe('findByEmail', () => {
    it('should return the user if email exists', async () => {
      jest.spyOn(prisma.user, 'findUniqueOrThrow').mockResolvedValue(user);
      const result = await service.findByEmail(user.email);
      expect(result).toEqual(user);
    });

    it('should throw an error if email does not exist', async () => {
      jest
        .spyOn(prisma.user, 'findUniqueOrThrow')
        .mockRejectedValue(
          new Prisma.PrismaClientKnownRequestError(
            'An operation failed because it depends on one or more records that were required but not found.',
            { code: PrismaError.RecordNotFound, clientVersion: '5.0' },
          ),
        );
      expect(service.findByEmail(user.email)).rejects.toThrowError(
        'User with that email does not exist',
      );
    });

    it('should throw a server error if other error is thrown', async () => {
      jest
        .spyOn(prisma.user, 'findUniqueOrThrow')
        .mockRejectedValue('some error');
      expect(service.findByEmail(user.email)).rejects.toThrowError(
        'Something went wrong',
      );
    });
  });

  describe('update', () => {
    it('should update the user', async () => {
      jest.spyOn(prisma.user, 'update').mockResolvedValue(user);
      const result = await service.update(user.id, { username: user.username });
      expect(result).toEqual(user);
    });

    it('should throw an exception if user is not found', async () => {
      jest
        .spyOn(prisma.user, 'update')
        .mockRejectedValue(
          new Prisma.PrismaClientKnownRequestError(
            'An operation failed because it depends on one or more records that were required but not found.',
            { code: PrismaError.RecordNotFound, clientVersion: '5.0' },
          ),
        );
      expect(
        service.update(user.id, { username: user.username }),
      ).rejects.toThrowError('User with that email does not exist');
    });

    it('should throw an error if username exists', async () => {
      jest
        .spyOn(prisma.user, 'update')
        .mockRejectedValue(
          new Prisma.PrismaClientKnownRequestError(
            'ERROR: duplicate key value violates unique constraint "username"',
            { clientVersion: '5.0', code: PrismaError.UniqueViolation },
          ),
        );
      expect(
        service.update(user.id, { username: user.username }),
      ).rejects.toThrowError('User with that username already exists');
    });

    it('should throw an error if email exists', async () => {
      jest
        .spyOn(prisma.user, 'update')
        .mockRejectedValue(
          new Prisma.PrismaClientKnownRequestError(
            'ERROR: duplicate key value violates unique constraint "email"',
            { clientVersion: '5.0', code: PrismaError.UniqueViolation },
          ),
        );
      expect(
        service.update(user.id, { email: user.email }),
      ).rejects.toThrowError('User with that email already exists');
    });

    it('should throw a server error if other error is thrown', async () => {
      jest.spyOn(prisma.user, 'update').mockRejectedValue('some error');
      expect(
        service.update(user.id, { username: user.username }),
      ).rejects.toThrowError('Something went wrong');
    });
  });

  describe('findById', () => {
    it('should return the user if the id exists', async () => {
      jest.spyOn(prisma.user, 'findUniqueOrThrow').mockResolvedValue(user);
      const result = await service.findById(user.id);
      expect(result).toEqual({
        ...user,
        rank: getCurrentRank(user.catPoints),
        xpsRequired: determineXPsRequired(user.currentLevel),
      });
    });

    it('should throw an exception if user is not found', async () => {
      jest
        .spyOn(prisma.user, 'findUniqueOrThrow')
        .mockRejectedValue(
          new Prisma.PrismaClientKnownRequestError(
            'An operation failed because it depends on one or more records that were required but not found.',
            { code: PrismaError.RecordNotFound, clientVersion: '5.0' },
          ),
        );
      expect(service.findById(user.id)).rejects.toThrowError(
        'Cannot find user with the given id',
      );
    });

    it('should throw a server error if other error is thrown', async () => {
      jest
        .spyOn(prisma.user, 'findUniqueOrThrow')
        .mockRejectedValue('some error');
      expect(service.findById(user.id)).rejects.toThrowError(
        'Something went wrong',
      );
    });
  });

  describe('findProfile', () => {
    it('should return the profile if the username exists', async () => {
      const lastTenAverageWpm = faker.number.int({ min: 0, max: 160 });
      const highestWpm = faker.number.int({ min: 0, max: 160 });
      const gamesPlayed = faker.number.int({ min: 0 });
      jest.spyOn(prisma.gameHistory, 'aggregate').mockResolvedValue({
        _avg: { wpm: lastTenAverageWpm },
        _max: { wpm: highestWpm },
        _count: { gameId: gamesPlayed },
        _min: { wpm: 0 },
        _sum: { catPoints: 0 },
      });
      jest.spyOn(prisma.user, 'findUniqueOrThrow').mockResolvedValue(user);
      const result = await service.findProfile(user.username);
      expect(result).toEqual({
        ...user,
        rank: getCurrentRank(user.catPoints),
        highestWpm,
        lastTenAverageWpm,
        gamesPlayed,
        xpsRequired: determineXPsRequired(user.currentLevel),
      });
      expect(prisma.gameHistory.aggregate).toHaveBeenCalledTimes(2);
    });

    it('should throw an exception if profile is not found', async () => {
      jest
        .spyOn(prisma.user, 'findUniqueOrThrow')
        .mockRejectedValue(
          new Prisma.PrismaClientKnownRequestError(
            'An operation failed because it depends on one or more records that were required but not found.',
            { code: PrismaError.RecordNotFound, clientVersion: '5.0' },
          ),
        );
      expect(service.findProfile(user.username)).rejects.toThrowError(
        'Cannot find player with the given username',
      );
    });

    it('should throw a server error if other error is thrown', async () => {
      jest
        .spyOn(prisma.user, 'findUniqueOrThrow')
        .mockRejectedValue('some error');
      expect(service.findProfile(user.username)).rejects.toThrowError(
        'Something went wrong',
      );
    });
  });
});
