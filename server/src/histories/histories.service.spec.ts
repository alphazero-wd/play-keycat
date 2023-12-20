import { Test, TestingModule } from '@nestjs/testing';
import { HistoriesService } from './histories.service';
import { PrismaService } from '../prisma/prisma.service';
import { Game, GameHistory, GameMode, User } from '@prisma/client';
import { userFixture } from '../users/test-utils';
import { gameFixture } from '../games/test-utils';
import { historyFixture } from './test-utils';
import { getCurrentRank } from '../ranks';
import { calculateXPsEarned } from '../xps';
import { PlayerFinishedDto } from '../games/dto';
import { calculateCPsEarned } from './utils';
import { determineMaxPlayersCount } from '../games/utils';

describe('HistoriesService', () => {
  let service: HistoriesService;
  let prisma: PrismaService;
  let user: User;
  let game: Game;
  let history: GameHistory;

  beforeEach(async () => {
    const prismaMock = {
      user: { update: jest.fn() },
      gameHistory: { create: jest.fn() },
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
      jest.spyOn(prisma.gameHistory, 'create').mockResolvedValue(history);
    });
    describe('when the CPs are positive', () => {
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

        expect(prisma.user.update).toHaveBeenCalledWith({
          where: { id: user.id },
          data: {
            currentLevel: user.currentLevel,
            xpsGained: user.xpsGained + xpsEarned,
            catPoints: user.catPoints + cpsEarned,
          },
        });

        expect(prisma.gameHistory.create).toHaveBeenCalledWith({
          data: {
            wpm,
            acc,
            gameId: game.id,
            catPoints: cpsEarned,
            playerId: user.id,
          },
        });
      });

      it('should not add CPs nor XPs if game mode is PRACTICE', async () => {
        const { wpm, acc } = payload;
        await service.create(
          payload,
          GameMode.PRACTICE,
          getCurrentRank(user.catPoints),
          game.paragraph,
          user,
        );

        expect(prisma.user.update).toHaveBeenCalledWith({
          where: { id: user.id },
          data: {
            currentLevel: user.currentLevel,
            xpsGained: user.xpsGained,
            catPoints: user.catPoints,
          },
        });

        expect(prisma.gameHistory.create).toHaveBeenCalledWith({
          data: {
            wpm,
            acc,
            gameId: game.id,
            catPoints: 0,
            playerId: user.id,
          },
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

        expect(prisma.user.update).toHaveBeenCalledWith({
          where: { id: user.id },
          data: {
            currentLevel: user.currentLevel,
            xpsGained: user.xpsGained + xpsGained,
            catPoints: user.catPoints,
          },
        });

        expect(prisma.gameHistory.create).toHaveBeenCalledWith({
          data: {
            wpm,
            acc,
            gameId: game.id,
            catPoints: 0,
            playerId: user.id,
          },
        });
      });
    });

    it('should make the CPs 0 if it can be negative (when player performs badly)', async () => {
      const badUser = { ...user, catPoints: 0 };
      jest.spyOn(prisma.user, 'update').mockResolvedValue(badUser);
      const { wpm, acc, position } = {
        position: determineMaxPlayersCount(GameMode.RANKED),
        wpm: 0,
        acc: 0,
      };
      const rank = getCurrentRank(1000);
      await service.create(
        { wpm, acc, position, gameId: game.id },
        GameMode.RANKED,
        rank,
        game.paragraph,
        badUser,
      );

      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: user.id },
        data: {
          currentLevel: user.currentLevel,
          xpsGained: expect.any(Number),
          catPoints: 0,
        },
      });

      expect(prisma.gameHistory.create).toHaveBeenCalledWith({
        data: {
          wpm,
          acc,
          gameId: game.id,
          catPoints: 0,
          playerId: user.id,
        },
      });
    });
  });
});
