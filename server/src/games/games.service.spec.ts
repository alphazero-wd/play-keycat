import { Test, TestingModule } from '@nestjs/testing';
import { GamesService } from './games.service';
import {
  BadRequestException,
  ForbiddenException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Game, GameMode, Prisma, User } from '@prisma/client';
import { userFixture } from '../users/test-utils';
import { UsersService } from '../users/users.service';
import { PrismaService } from '../prisma/prisma.service';
import { getCurrentRank } from '../ranks';
import { determineXPsRequired } from '../xps';
import { gameFixture } from './test-utils';
import { PrismaError } from '../prisma/prisma-error';
import { WsException } from '@nestjs/websockets';
import { determineMaxPlayersCount } from './utils';

describe('GamesService', () => {
  let gamesService: GamesService;
  let usersService: UsersService;
  let prisma: PrismaService;
  let user: User;
  let game: Game;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GamesService,
        {
          provide: UsersService,
          useValue: {
            findById: jest.fn(),
          },
        },
        {
          provide: PrismaService,
          useValue: {
            user: { update: jest.fn(), count: jest.fn() },
            $queryRaw: jest.fn(),
            game: {
              create: jest.fn(),
              findUniqueOrThrow: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
            },
            gameHistory: {
              count: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    gamesService = module.get<GamesService>(GamesService);
    usersService = module.get<UsersService>(UsersService);
    prisma = module.get<PrismaService>(PrismaService);
    user = userFixture();
    game = gameFixture();
  });

  it('should be defined', () => {
    expect(gamesService).toBeDefined();
    expect(usersService).toBeDefined();
  });

  describe('checkPlayerAlreadyInGame', () => {
    it('should throw a not found error if user is not found', () => {
      jest
        .spyOn(usersService, 'findById')
        .mockRejectedValue(new NotFoundException());
      expect(
        gamesService.checkPlayerAlreadyInGame(user.id),
      ).rejects.toThrowError(NotFoundException);
    });

    it('should throw a not found error if they are already in another game', () => {
      jest.spyOn(usersService, 'findById').mockResolvedValue({
        ...user,
        inGameId: 100,
        rank: getCurrentRank(user.catPoints),
        xpsRequired: determineXPsRequired(user.currentLevel),
      });
      expect(
        gamesService.checkPlayerAlreadyInGame(user.id),
      ).rejects.toThrowError(ForbiddenException);
    });

    it('should do nothing if the user is found and is not in any game', async () => {
      jest.spyOn(usersService, 'findById').mockResolvedValue({
        ...user,
        rank: getCurrentRank(user.catPoints),
        xpsRequired: determineXPsRequired(user.currentLevel),
      });
      expect(
        gamesService.checkPlayerAlreadyInGame(user.id),
      ).resolves.not.toThrow();
    });
  });

  describe('updateCurrentlyPlayingGame', () => {
    it('should throw an exception if user is not found', async () => {
      jest.spyOn(prisma.user, 'update').mockRejectedValue(
        new Prisma.PrismaClientKnownRequestError('', {
          clientVersion: '5.0',
          code: PrismaError.RecordNotFound,
        }),
      );
      expect(
        gamesService.updateCurrentlyPlayingGame(user.id, game.id),
      ).rejects.toThrowError(NotFoundException);
    });

    it('should throw an exception if game is not found', async () => {
      jest.spyOn(prisma.user, 'update').mockRejectedValue(
        new Prisma.PrismaClientKnownRequestError('', {
          clientVersion: '5.0',
          code: PrismaError.ForeignViolation,
        }),
      );
      expect(
        gamesService.updateCurrentlyPlayingGame(user.id, game.id),
      ).rejects.toThrowError(NotFoundException);
    });

    it('should add player to game', async () => {
      jest.spyOn(prisma.user, 'update').mockResolvedValue(user);
      expect(
        gamesService.updateCurrentlyPlayingGame(user.id, game.id),
      ).resolves.not.toThrowError();
    });

    it('should remove player from game', async () => {
      jest.spyOn(prisma.user, 'update').mockResolvedValue(user);
      expect(
        gamesService.updateCurrentlyPlayingGame(user.id, null),
      ).resolves.not.toThrowError();
    });
  });

  describe('findOne', () => {
    it('should return undefined if no game is found', async () => {
      jest.spyOn(prisma, '$queryRaw').mockResolvedValue([]);
      expect(await gamesService.findOne(user, GameMode.CASUAL)).toBeUndefined();
      expect(determineMaxPlayersCount).toHaveBeenCalledWith(GameMode.CASUAL);
    });

    it('should return game id to join if there is at least 1', async () => {
      jest.spyOn(prisma, '$queryRaw').mockResolvedValue([{ id: 100 }]);
      expect(await gamesService.findOne(user, GameMode.RANKED)).toBeUndefined();
      expect(determineMaxPlayersCount).toHaveBeenCalledWith(GameMode.RANKED);
    });
  });

  describe('create', () => {
    it('should create a game', async () => {
      jest.spyOn(prisma.game, 'create').mockResolvedValue(game);
      expect(await gamesService.create(user, GameMode.CASUAL)).toBe(game.id);
    });
  });
});
