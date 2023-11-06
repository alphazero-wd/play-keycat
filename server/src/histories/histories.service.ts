import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { Prisma, User } from '@prisma/client';
import { PrismaError } from '../prisma/prisma-error';
import { PrismaService } from '../prisma/prisma.service';
import { PlayerFinishedDto } from '../games/dto';
import { calculateCPs } from './utils';
import { RankUpdateStatus, getCurrentRank, ranks } from '../ranks';

@Injectable()
export class HistoriesService {
  constructor(private prisma: PrismaService) {}

  async create(
    { acc, wpm, position, gameId }: PlayerFinishedDto,
    averageCPs: number,
    user: User,
  ) {
    try {
      const currentRank = getCurrentRank(averageCPs);
      const catPoints = calculateCPs(
        wpm - ranks[currentRank].minWpm,
        acc - ranks[currentRank].minAcc,
        position,
      );
      const results = await this.prisma.$transaction([
        this.prisma.user.update({
          where: { id: user.id },
          data: { catPoints: Math.max(user.catPoints + catPoints, 0) },
        }),
        this.prisma.gameHistory.create({
          data: {
            wpm,
            acc,
            gameId,
            catPoints: user.catPoints + catPoints < 0 ? 0 : catPoints,
            playerId: user.id,
          },
        }),
      ]);
      return results;
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
        game: { select: { startedAt: true } },
      },
      orderBy: { game: { startedAt: 'desc' } },
    });
    return { playerHistories, playerHistoriesCount };
  }

  checkRankUpdate(user: User, catPoints: number) {
    const prevRank = getCurrentRank(user.catPoints - catPoints);
    const currentRank = getCurrentRank(user.catPoints);
    const rankUpdateStatus =
      catPoints < 0 ? RankUpdateStatus.DEMOTED : RankUpdateStatus.PROMOTED;
    return { prevRank, currentRank, rankUpdateStatus };
  }
}
