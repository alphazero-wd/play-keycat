import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateHistoryDto, FindPlayerHistoriesDto } from './dto';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { PrismaError } from '../prisma/prisma-error';
import { WsException } from '@nestjs/websockets';
import { UsersService } from '../users/users.service';

@Injectable()
export class HistoriesService {
  constructor(
    private prisma: PrismaService,
    private usersService: UsersService,
  ) {}

  async create({ playerId, catPoints, ...createHistoryDto }: CreateHistoryDto) {
    try {
      const user = await this.usersService.findById(playerId);
      const gameHistory = await this.prisma.$transaction([
        this.prisma.user.update({
          where: { id: playerId },
          data: { catPoints: Math.max(user.catPoints + catPoints, 0) },
        }),
        this.prisma.gameHistory.create({
          data: {
            ...createHistoryDto,
            catPoints: user.catPoints + catPoints < 0 ? 0 : catPoints,
            playerId,
            gameId: user.inGameId,
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

  async findByPlayer(
    username: string,
    { offset, limit }: FindPlayerHistoriesDto,
  ) {
    const playerHistoriesCount = await this.prisma.gameHistory.count({
      where: { player: { username } },
    });
    const playerHistories = await this.prisma.gameHistory.findMany({
      where: { player: { username } },
      take: limit,
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
