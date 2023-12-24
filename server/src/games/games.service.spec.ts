import { faker } from '@faker-js/faker';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { WsException } from '@nestjs/websockets';
import { Game, GameMode, Prisma, User } from '@prisma/client';
import { PrismaError } from '../prisma/prisma-error';
import { PrismaService } from '../prisma/prisma.service';
import { getCurrentRank } from '../ranks';
import { userFixture } from '../users/test-utils';
import { UsersService } from '../users/users.service';
import { determineXPsRequired } from '../xps';
import { GamesService } from './games.service';
import { gameFixture } from './test-utils';
import { v4 } from 'uuid';

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
        inGameId: v4(),
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
    });

    it('should return game id to join if there is at least 1', async () => {
      jest.spyOn(prisma, '$queryRaw').mockResolvedValue([{ id: game.id }]);
      expect(await gamesService.findOne(user, GameMode.RANKED)).toBe(game.id);
    });
  });

  describe('create', () => {
    it('should create a game', async () => {
      jest.spyOn(prisma.game, 'create').mockResolvedValue(game);
      expect(await gamesService.create(user, GameMode.CASUAL)).toBe(game.id);
    });
  });

  describe('getDisplayInfo', () => {
    it('should throw an exception if game is not found', async () => {
      jest.spyOn(prisma.game, 'findUniqueOrThrow').mockRejectedValue(
        new Prisma.PrismaClientKnownRequestError('not found', {
          code: PrismaError.RecordNotFound,
          clientVersion: '5.0',
        }),
      );
      expect(gamesService.getDisplayInfo(game.id)).rejects.toThrowError(
        WsException,
      );
    });

    it('should return game if it is found', async () => {
      jest.spyOn(prisma.game, 'findUniqueOrThrow').mockResolvedValue(game);
      expect(gamesService.getDisplayInfo(game.id)).resolves.toEqual(game);
    });
  });

  describe('updateTime', () => {
    it('should throw an exception if game is not found', async () => {
      jest.spyOn(prisma.game, 'update').mockRejectedValue(
        new Prisma.PrismaClientKnownRequestError('not found', {
          code: PrismaError.RecordNotFound,
          clientVersion: '5.0',
        }),
      );
      expect(
        gamesService.updateTime(game.id, 'startedAt'),
      ).rejects.toThrowError(WsException);
    });

    it('should update the game time', async () => {
      jest.spyOn(prisma.game, 'update').mockResolvedValue(game);
      const updatedGame = await gamesService.updateTime(
        game.id,
        'startedAt',
        10,
      );

      expect(updatedGame).toEqual(game);
    });
  });

  describe('countPlayersInGame', () => {
    it('should return the number of in-game players', () => {
      jest.spyOn(prisma.user, 'count').mockResolvedValue(348);
      expect(gamesService.countPlayersInGame(game.id)).resolves.toBe(348);
      expect(prisma.user.count).toHaveBeenCalledWith({
        where: { inGameId: game.id },
      });
    });
  });

  describe('removeIfEmpty', () => {
    it('should throw an error if game is not found', () => {
      jest.spyOn(prisma.gameHistory, 'count').mockResolvedValue(0);
      jest.spyOn(prisma.game, 'delete').mockRejectedValue(
        new Prisma.PrismaClientKnownRequestError('', {
          code: PrismaError.RecordNotFound,
          clientVersion: '5.0',
        }),
      );
      expect(gamesService.removeIfEmpty(game.id)).rejects.toThrowError(
        WsException,
      );
    });

    it('should not delete the game if there are histories associated with the games', async () => {
      jest.spyOn(prisma.gameHistory, 'count').mockResolvedValue(2);
      jest.spyOn(prisma.game, 'delete').mockResolvedValue(game);
      await gamesService.removeIfEmpty(game.id);
      expect(prisma.game.delete).toHaveBeenCalledTimes(0);
    });

    it('should delete the game if it has been abandoned', async () => {
      jest.spyOn(prisma.gameHistory, 'count').mockResolvedValue(0);
      jest.spyOn(prisma.game, 'delete').mockResolvedValue(game);
      await gamesService.removeIfEmpty(game.id);
      expect(prisma.game.delete).toHaveBeenCalledTimes(1);
      expect(prisma.game.delete).toHaveBeenCalledWith({
        where: { id: game.id },
      });
    });
  });

  describe('findById', () => {
    it('should throw an exception if game is not found', async () => {
      jest.spyOn(prisma.game, 'findUniqueOrThrow').mockRejectedValue(
        new Prisma.PrismaClientKnownRequestError('not found', {
          code: PrismaError.RecordNotFound,
          clientVersion: '5.0',
        }),
      );
      expect(gamesService.findById(game.id, user.id)).rejects.toThrowError(
        NotFoundException,
      );
    });

    it('should return game if it is found', async () => {
      jest.spyOn(prisma.game, 'findUniqueOrThrow').mockResolvedValue(game);
      expect(gamesService.findById(game.id, user.id)).resolves.toEqual(game);
    });
  });
});
