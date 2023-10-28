import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

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
      topPlayers: topPlayers.map(({ histories, ...player }) => {
        const lastTenAverageWpm =
          histories.reduce((avg, h) => avg + h.wpm, 0) / 10;
        return { ...player, lastTenAverageWpm };
      }),
      topPlayersCount,
    };
  }

  async findTop100Games() {
    const topGamesCount = await this.prisma.game.count({
      take: 100,
    });
    const topGames = await this.prisma.gameHistory.findMany({
      take: 10,
      select: {
        gameId: true,
        playerId: true,
        catPoints: true,
        wpm: true,
        acc: true,
        player: { select: { username: true } },
      },
      orderBy: { wpm: 'desc' },
    });

    return { topGames, topGamesCount };
  }
}
