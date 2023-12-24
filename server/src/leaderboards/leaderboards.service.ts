import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { getCurrentRank } from '../ranks';
import { PAGE_LIMIT, TOP_LEADERBOARDS } from '../common/constants';

@Injectable()
export class LeaderboardsService {
  // when a player finishes a game, emit id and CPs
  // the client listens for that and update in the leaderboard
  constructor(private prisma: PrismaService) {}

  async findTop100Players(offset: number) {
    const topPlayersCount = await this.prisma.user.count({
      take: TOP_LEADERBOARDS,
    });
    const topPlayers = await this.prisma.user.findMany({
      take: PAGE_LIMIT,
      skip: offset,
      select: {
        id: true,
        username: true,
        catPoints: true,
        _count: { select: { histories: true } },
        histories: {
          select: { wpm: true },
          take: PAGE_LIMIT,
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
          lastTenAverageWpm: Math.trunc(sumWpm / histories.length) || 0,
          gamesPlayed: _count.histories,
        };
      }),
      topPlayersCount,
    };
  }
}
