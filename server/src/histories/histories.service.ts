import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { GameMode, Prisma, User } from '@prisma/client';
import { PrismaError } from '../prisma/prisma-error';
import { PrismaService } from '../prisma/prisma.service';
import { PlayerFinishedDto } from '../games/dto';
import { calculateCPsEarned } from './utils';
import { RankUpdateStatus, getCurrentRank } from '../ranks';
import { levelUp } from './utils';
import { calculateXPsEarned } from '../xps';

@Injectable()
export class HistoriesService {
  constructor(private prisma: PrismaService) {}

  async create(
    { acc, wpm, position, gameId }: Omit<PlayerFinishedDto, 'leftPlayersCount'>,
    gameMode: GameMode,
    rank: string,
    paragraph: string,
    user: User,
  ) {
    try {
      const xpsBonus =
        gameMode !== GameMode.PRACTICE
          ? calculateXPsEarned(wpm, acc, position, paragraph)
          : 0;
      const catPoints =
        gameMode === GameMode.RANKED
          ? calculateCPsEarned(wpm, acc, position, rank)
          : 0;
      const results = await this.prisma.$transaction(async (client) => {
        const { newLevel, newXPsGained, hasLevelUp } = levelUp(user, xpsBonus);
        const player = await client.user.update({
          where: { id: user.id },
          data: {
            currentLevel: newLevel,
            xpsGained: newXPsGained,
            catPoints: Math.max(user.catPoints + catPoints, 0),
          },
        });
        const history = await client.gameHistory.create({
          data: {
            wpm,
            acc,
            gameId,
            catPoints: user.catPoints + catPoints < 0 ? 0 : catPoints,
            playerId: user.id,
          },
        });
        return { hasLevelUp, player, history };
      });
      return { ...results, xpsBonus };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === PrismaError.ForeignViolation)
          throw new WsException(
            'Cannot create history because game or player not found',
          );
        if (error.code === PrismaError.UniqueViolation)
          throw new WsException('The history already exists');
      }
      throw new WsException('Something went wrong');
    }
  }

  async countPlayersFinished(gameId: number) {
    const gameHistoriesCount = await this.prisma.gameHistory.count({
      where: { gameId },
    });

    return gameHistoriesCount;
  }

  async findByGame(gameId: number) {
    try {
      const game = await this.prisma.game.findUniqueOrThrow({
        where: { id: gameId },
        include: {
          histories: {
            orderBy: { wpm: 'desc' },
            select: {
              wpm: true,
              catPoints: true,
              acc: true,
              player: true,
            },
          },
        },
      });
      return game;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError)
        if (error.code === PrismaError.RecordNotFound)
          throw new NotFoundException('Cannot find game with the given id');
      throw new InternalServerErrorException('Something went wrong');
    }
  }

  async findByPlayer(username: string, offset: number) {
    const playerHistoriesCount = await this.prisma.gameHistory.count({
      where: { player: { username } },
    });
    const playerHistories = await this.prisma.gameHistory.findMany({
      where: { player: { username } },
      take: 10,
      skip: offset,
      select: {
        gameId: true,
        wpm: true,
        acc: true,
        catPoints: true,
        game: { select: { startedAt: true, mode: true } },
      },
      orderBy: { game: { startedAt: 'desc' } },
    });
    return { playerHistories, playerHistoriesCount };
  }

  checkRankUpdate(user: User, catPoints: number) {
    const prevRank = getCurrentRank(user.catPoints);
    const currentRank = getCurrentRank(user.catPoints + catPoints);
    const rankUpdateStatus =
      catPoints < 0 ? RankUpdateStatus.DEMOTED : RankUpdateStatus.PROMOTED;
    return { prevRank, currentRank, rankUpdateStatus };
  }
}
