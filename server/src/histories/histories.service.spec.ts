import { Test, TestingModule } from '@nestjs/testing';
import { HistoriesService } from './histories.service';
import { PrismaService } from '../prisma/prisma.service';
import { Game, GameHistory, GameMode, Prisma, User } from '@prisma/client';
import { userFixture } from '../users/test-utils';
import { gameFixture } from '../games/test-utils';
import { historyFixture } from './test-utils';
import { getCurrentRank } from '../ranks';
import { calculateXPsEarned } from '../xps';
import { PlayerFinishedDto } from '../games/dto';
import { calculateCPsEarned, levelUp } from './utils';
import { PrismaError } from '../prisma/prisma-error';
import { NotFoundException } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { PAGE_LIMIT } from '../common/constants';

describe('HistoriesService', () => {
  let service: HistoriesService;
  let prisma: PrismaService;
  let user: User;
  let game: Game;
  let history: GameHistory;

  beforeEach(async () => {
    const prismaMock = {
      user: { update: jest.fn() },
      game: { findUniqueOrThrow: jest.fn() },
      gameHistory: { create: jest.fn(), count: jest.fn(), findMany: jest.fn() },
      $transaction: jest
        .fn()
        .mockImplementation((callback) => callback(prismaMock)),
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HistoriesService,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
      ],
    }).compile();

    service = module.get<HistoriesService>(HistoriesService);
    prisma = module.get<PrismaService>(PrismaService);
    user = userFixture();
    game = gameFixture();
    history = historyFixture(game.id, user.id);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    let payload: Omit<PlayerFinishedDto, 'leftPlayersCount'>;
    beforeEach(() => {
      payload = {
        gameId: game.id,
        acc: history.acc.toNumber(),
        position: 1,
        wpm: history.wpm,
      };
    });
    describe('and a history is failed to be created', () => {
      it('should throw a WS Exception if game or player not found', () => {
        jest.spyOn(prisma.gameHistory, 'create').mockRejectedValue(
          new Prisma.PrismaClientKnownRequestError('', {
            clientVersion: '5.0',
            code: PrismaError.RecordNotFound,
          }),
        );
        const rank = getCurrentRank(user.catPoints);
        expect(
          service.create(payload, GameMode.CASUAL, rank, game.paragraph, user),
        ).rejects.toThrowError(WsException);
      });

      it('should throw a WS Exception if it has been created before', () => {
        jest.spyOn(prisma.gameHistory, 'create').mockRejectedValue(
          new Prisma.PrismaClientKnownRequestError('', {
            clientVersion: '5.0',
            code: PrismaError.ForeignViolation,
          }),
        );
        const rank = getCurrentRank(user.catPoints);
        expect(
          service.create(payload, GameMode.CASUAL, rank, game.paragraph, user),
        ).rejects.toThrowError(WsException);
      });
    });

    describe('and a history is successfully created', () => {
      beforeEach(() =>
        jest.spyOn(prisma.gameHistory, 'create').mockResolvedValue(history),
      );
      it('should add CPs and XPs if game mode is RANKED', async () => {
        jest.spyOn(prisma.user, 'update').mockResolvedValue(user);
        const { wpm, acc, position } = payload;
        const rank = getCurrentRank(user.catPoints);
        const xpsEarned = calculateXPsEarned(
          wpm,
          acc,
          position,
          game.paragraph,
        );
        const cpsEarned = calculateCPsEarned(wpm, acc, position, rank);
        await service.create(
          payload,
          GameMode.RANKED,
          rank,
          game.paragraph,
          user,
        );
        expect(prisma.user.update).toHaveBeenCalledWith(
          expect.objectContaining({
            data: expect.objectContaining({
              xpsGained: user.xpsGained + xpsEarned,
              catPoints: user.catPoints + cpsEarned,
            }),
          }),
        );

        expect(prisma.gameHistory.create).toHaveBeenCalledWith({
          data: expect.objectContaining({ catPoints: cpsEarned }),
        });
      });

      it('should not add CPs nor XPs if game mode is PRACTICE', async () => {
        await service.create(
          payload,
          GameMode.PRACTICE,
          getCurrentRank(user.catPoints),
          game.paragraph,
          user,
        );

        expect(prisma.user.update).toHaveBeenCalledWith(
          expect.objectContaining({
            data: expect.objectContaining({
              xpsGained: user.xpsGained,
              catPoints: user.catPoints,
            }),
          }),
        );

        expect(prisma.gameHistory.create).toHaveBeenCalledWith({
          data: expect.objectContaining({ catPoints: 0 }),
        });
      });

      it('should not add CPs if game mode is CASUAL', async () => {
        const { wpm, acc, position } = payload;
        await service.create(
          payload,
          GameMode.CASUAL,
          getCurrentRank(user.catPoints),
          game.paragraph,
          user,
        );
        const xpsGained = calculateXPsEarned(
          wpm,
          acc,
          position,
          game.paragraph,
        );

        expect(prisma.user.update).toHaveBeenCalledWith(
          expect.objectContaining({
            data: expect.objectContaining({
              xpsGained: user.xpsGained + xpsGained,
              catPoints: user.catPoints,
            }),
          }),
        );

        expect(prisma.gameHistory.create).toHaveBeenCalledWith({
          data: expect.objectContaining({ catPoints: 0 }),
        });
      });

      it('should level up correctly', async () => {
        const { wpm, acc, position } = payload; // make very good performance so level up is feasible
        const aboutToLevelUpUser = { ...user, xpsGained: 90 }; // make XPs close to next level
        jest.spyOn(prisma.user, 'update').mockResolvedValue(user);
        const xpsEarned = calculateXPsEarned(
          wpm,
          acc,
          position,
          game.paragraph,
        );
        const { newLevel, newXPsGained } = levelUp(
          aboutToLevelUpUser,
          xpsEarned,
        );
        const results = await service.create(
          { ...payload, wpm, acc, position },
          GameMode.CASUAL,
          getCurrentRank(user.catPoints),
          game.paragraph,
          aboutToLevelUpUser,
        );
        expect(prisma.user.update).toHaveBeenCalledWith(
          expect.objectContaining({
            data: expect.objectContaining({
              currentLevel: newLevel,
              xpsGained: newXPsGained,
            }),
          }),
        );
        expect(results.hasLevelUp).toBeTruthy();
      });
    });

    describe('countPlayersFinished', () => {
      it('should count finished players in a game via its id', async () => {
        jest.spyOn(prisma.gameHistory, 'count').mockResolvedValue(2);
        await service.countPlayersFinished(game.id);
        expect(prisma.gameHistory.count).toHaveBeenCalledWith({
          where: { gameId: game.id },
        });
      });
    });
  });

  describe('findByGame', () => {
    it('should throw a not found error if game does not exist', async () => {
      jest.spyOn(prisma.game, 'findUniqueOrThrow').mockRejectedValue(
        new Prisma.PrismaClientKnownRequestError('', {
          clientVersion: '5.0',
          code: PrismaError.RecordNotFound,
        }),
      );

      expect(service.findByGame(game.id)).rejects.toThrowError(
        NotFoundException,
      );
    });

    it('should sort histories by WPM in descending order', async () => {
      jest.spyOn(prisma.game, 'findUniqueOrThrow').mockResolvedValue(game);
      await service.findByGame(game.id);
      expect(prisma.game.findUniqueOrThrow).toHaveBeenCalledWith(
        expect.objectContaining({
          include: expect.objectContaining({
            histories: expect.objectContaining({
              orderBy: {
                wpm: 'desc',
              },
            }),
          }),
        }),
      );
    });
  });

  describe('findByPlayer', () => {
    let totalPlayerGameHistories: number;
    let offset: number;
    beforeEach(() => {
      totalPlayerGameHistories = 100;
      offset = 20;
      jest
        .spyOn(prisma.gameHistory, 'count')
        .mockResolvedValue(totalPlayerGameHistories);
      jest.spyOn(prisma.gameHistory, 'findMany').mockResolvedValue([history]);
    });
    it("should return a limited number of histories by player's username from an offset", async () => {
      const results = await service.findByPlayer(user.username, offset);
      expect(results).toEqual({
        playerHistories: [history],
        playerHistoriesCount: totalPlayerGameHistories,
      });
      expect(prisma.gameHistory.count).toHaveBeenCalledWith({
        where: { player: { username: user.username } },
      });
      expect(prisma.gameHistory.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          take: PAGE_LIMIT,
          skip: offset,
        }),
      );
    });

    it('should get associated game for each history and sort by startedAt in descending order', async () => {
      await service.findByPlayer(user.username, offset);
      expect(prisma.gameHistory.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          select: expect.objectContaining({
            game: { select: { startedAt: true, mode: true } },
          }),
          orderBy: { game: { startedAt: 'desc' } },
        }),
      );
    });
  });
});
