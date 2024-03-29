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
import { levelUp } from './utils';
import { calculateXPsEarned } from '../xps';
import { PAGE_LIMIT } from '../common/constants';

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
      const { newLevel, newXPsGained, hasLevelUp } = levelUp(user, xpsBonus);
      const results = await this.prisma.$transaction(async (client) => {
        const player = await client.user.update({
          where: { id: user.id },
          data: {
            currentLevel: newLevel,
            xpsGained: newXPsGained,
            catPoints: user.catPoints + catPoints,
          },
        });
        const history = await client.gameHistory.create({
          data: {
            wpm,
            acc,
            gameId,
            catPoints,
            playerId: user.id,
          },
        });
        return { player, history };
      });
      return { ...results, hasLevelUp, xpsBonus };
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

  async countPlayersFinished(gameId: string) {
    const gameHistoriesCount = await this.prisma.gameHistory.count({
      where: { gameId },
    });

    return gameHistoriesCount;
  }

  async findByGame(gameId: string) {
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
      take: PAGE_LIMIT,
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
}
