import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { Prisma, User } from '@prisma/client';
import { PrismaError } from '../prisma/prisma-error';
import { PrismaService } from '../prisma/prisma.service';
import { CreateHistoryDto } from './dto';

@Injectable()
export class HistoriesService {
  constructor(private prisma: PrismaService) {}

  async create(
    { catPoints, ...createHistoryDto }: CreateHistoryDto,
    user: User,
  ) {
    try {
      const gameHistory = await this.prisma.$transaction([
        this.prisma.user.update({
          where: { id: user.id },
          data: { catPoints: Math.max(user.catPoints + catPoints, 0) },
        }),
        this.prisma.gameHistory.create({
          data: {
            ...createHistoryDto,
            catPoints: user.catPoints + catPoints < 0 ? 0 : catPoints,
            playerId: user.id,
          },
        }),
      ]);
      return gameHistory;
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
            orderBy: [{ timeTaken: 'asc' }, { wpm: 'desc' }],
            select: {
              timeTaken: true,
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
      take: 100,
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
}
