import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { getCurrentRank } from '../ranks';

@Injectable()
export class LeaderboardsService {
  // when a player finishes a game, emit id and CPs
  // the client listens for that and update in the leaderboard
  constructor(private prisma: PrismaService) {}

  async findTop100Players(offset: number) {
    const topPlayersCount = await this.prisma.user.count({
      take: 100,
    });
    const topPlayers = await this.prisma.user.findMany({
      take: 10,
      skip: offset,
      select: {
        id: true,
        username: true,
        catPoints: true,
        _count: { select: { histories: true } },
        histories: {
          select: { wpm: true },
          take: 10,
          orderBy: { game: { startedAt: 'desc' } },
        },
      },
      orderBy: { catPoints: 'desc' },
    });

    return {
      topPlayers: topPlayers.map(({ histories, _count, ...player }) => {
        const { sum: sumWpm, max: highestWpm } = histories.reduce(
          (acc, h) => ({ max: Math.max(acc.max, h.wpm), sum: acc.sum + h.wpm }),
          { max: -Infinity, sum: 0 },
        );
        return {
          ...player,
          rank: getCurrentRank(player.catPoints),
          highestWpm,
          lastTenAverageWpm: Math.trunc(
            sumWpm / Math.min(10, histories.length),
          ),
          gamesPlayed: _count.histories,
        };
      }),
      topPlayersCount,
    };
  }
}
