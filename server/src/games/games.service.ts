import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GameMode, Prisma, User } from '@prisma/client';
import { PrismaError } from '../prisma/prisma-error';
import { WsException } from '@nestjs/websockets';
import { UsersService } from '../users/users.service';
import {
  addSeconds,
  determineMaxPlayersCount,
  generateParagraph,
} from './utils';
import { v4 } from 'uuid';

@Injectable()
export class GamesService {
  constructor(
    private prisma: PrismaService,
    private usersService: UsersService,
  ) {}

  async checkPlayerAlreadyInGame(playerId: string) {
    try {
      const player = await this.usersService.findById(playerId);
      if (player.inGameId)
        throw new ForbiddenException(
          'You are already in a game. Please leave the game before joining in another one',
        );
    } catch (error) {
      if (error instanceof InternalServerErrorException)
        throw new InternalServerErrorException('Something went wrong');
      throw error;
    }
  }

  async updateCurrentlyPlayingGame(playerId: string, gameId: string | null) {
    await this.prisma.user.update({
      where: { id: playerId },
      data: { inGameId: gameId },
    });
  }

  async findOne(user: User, gameMode: GameMode) {
    const maxPlayersCount = determineMaxPlayersCount(gameMode);
    try {
      const result = await this.prisma.$queryRaw<[] | [{ id: string }]>`
        SELECT g."id" FROM "Game" g
        LEFT JOIN "User" u
        ON u."inGameId" = g."id"
        WHERE g."minPoints" <= ${user.catPoints}
        AND g."maxPoints" >= ${user.catPoints}
        AND g."startedAt" IS NULL
        AND g."mode"::text = ${gameMode}
        GROUP BY g."id"
        HAVING COUNT(u."id") < ${maxPlayersCount}
        LIMIT 1;
      `;
      return result[0]?.id;
    } catch (error) {
      throw new InternalServerErrorException('Something went wrong');
    }
  }

  async create(user: User, gameMode: GameMode) {
    try {
      const paragraph = generateParagraph();
      const minPoints = Math.max(user.catPoints - 250, 0);
      const maxPoints = user.catPoints + 250;

      const game = await this.prisma.game.create({
        data: { id: v4(), minPoints, maxPoints, paragraph, mode: gameMode },
      });
      return game.id;
    } catch (error) {
      throw new InternalServerErrorException('Something went wrong');
    }
  }

  async getDisplayInfo(gameId: string) {
    try {
      const game = await this.prisma.game.findUniqueOrThrow({
        where: { id: gameId },
        select: {
          mode: true,
          paragraph: true,
          players: { select: { id: true, username: true, catPoints: true } },
        },
      });
      return game;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError)
        if (error.code === PrismaError.RecordNotFound)
          throw new WsException('Cannot find game with the given id');
      throw new WsException('Something went wrong');
    }
  }

  async updateTime(
    gameId: string,
    field: 'startedAt' | 'endedAt',
    extraSeconds: number = 0,
  ) {
    try {
      const game = await this.prisma.game.update({
        where: { id: gameId },
        data: { [field]: addSeconds(extraSeconds) },
      });

      return game;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError)
        if (error.code === PrismaError.RecordNotFound)
          throw new WsException('Cannot update game with the given id');
      throw new WsException('Something went wrong');
    }
  }

  async countPlayersInGame(gameId: string) {
    const playersCount = await this.prisma.user.count({
      where: { inGameId: gameId },
    });
    return playersCount;
  }

  async removeIfEmpty(gameId: string) {
    try {
      const historiesCount = await this.prisma.gameHistory.count({
        where: { gameId },
      });
      const toBeDeleted = historiesCount === 0;
      // if the game has ended, but everyone has left the game then don't delete the game
      if (toBeDeleted) await this.prisma.game.delete({ where: { id: gameId } });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError)
        if (error.code === PrismaError.RecordNotFound)
          throw new WsException('Cannot delete game with the given id');
      throw new WsException(error.message);
    }
  }

  async findById(id: string, userId: string) {
    try {
      const game = await this.prisma.game.findUniqueOrThrow({
        where: { id, startedAt: null, players: { some: { id: userId } } },
      });
      return game;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError)
        if (error.code === PrismaError.RecordNotFound)
          throw new NotFoundException('Cannot find game with the given id');
      throw new NotFoundException('Something went wrong');
    }
  }
}
