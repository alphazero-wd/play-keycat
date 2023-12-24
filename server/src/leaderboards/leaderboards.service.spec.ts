import { Test, TestingModule } from '@nestjs/testing';
import { LeaderboardsService } from './leaderboards.service';
import { PrismaService } from '../prisma/prisma.service';
import { Game, User } from '@prisma/client';
import { userFixture } from '../users/test-utils';
import { historyFixture } from '../histories/test-utils';
import { gameFixture } from '../games/test-utils';
import { v4 } from 'uuid';
import { getCurrentRank } from '../ranks';

describe('LeaderboardsService', () => {
  let service: LeaderboardsService;
  let prisma: PrismaService;
  let user: User;
  let game: Game;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LeaderboardsService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              count: jest.fn(),
              findMany: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<LeaderboardsService>(LeaderboardsService);
    prisma = module.get<PrismaService>(PrismaService);
    user = userFixture();
    game = gameFixture();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findTop100Players', () => {
    it('should get the leaderboards', async () => {
      const topPlayersCount = 25;
      const offset = 20;
      const histories = [
        historyFixture(game.id, user.id),
        historyFixture(v4(), user.id),
        historyFixture(v4(), user.id),
        historyFixture(v4(), user.id),
      ];
      const sumWpm = histories
        .map((h) => h.wpm)
        .reduce((acc, wpm) => acc + wpm, 0);
      jest.spyOn(prisma.user, 'count').mockResolvedValue(topPlayersCount);
      jest.spyOn(prisma.user, 'findMany').mockResolvedValue([
        {
          ...user,
          _count: { histories: histories.length },
          histories,
        },
      ] as unknown as User[]);
      const result = await service.findTop100Players(offset);
      expect(result).toEqual({
        topPlayers: [
          {
            ...user,
            rank: getCurrentRank(user.catPoints),
            highestWpm: Math.max(...histories.map((h) => h.wpm)),
            lastTenAverageWpm: Math.trunc(sumWpm / histories.length) || 0,
            gamesPlayed: histories.length,
          },
        ],
        topPlayersCount,
      });
    });
  });
});
