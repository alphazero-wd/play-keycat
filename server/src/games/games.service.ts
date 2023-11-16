import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, User } from '@prisma/client';
import { PrismaError } from '../prisma/prisma-error';
import { WsException } from '@nestjs/websockets';
import { UsersService } from '../users/users.service';
import { generateParagraph } from './utils';
import { MAX_PLAYERS_COUNT } from '../common/constants';

@Injectable()
export class GamesService {
  constructor(
    private prisma: PrismaService,
    private usersService: UsersService,
  ) {}

  async join(user: User) {
    await this.checkPlayerAlreadyInGame(user.id);
    let gameIdToJoin = await this.findOne(user);
    if (!gameIdToJoin) gameIdToJoin = await this.create(user);
    await this.addPlayer(gameIdToJoin, user.id);
    return gameIdToJoin;
  }

  async getPlayersInGame(gameId: number) {
    try {
      const game = await this.prisma.game.findUniqueOrThrow({
        where: { id: gameId },
        select: {
          players: { select: { id: true, username: true, catPoints: true } },
          startedAt: true,
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

  async removePlayer(playerId: number) {
    try {
      const { inGameId } = await this.usersService.findById(playerId);
      await this.prisma.user.update({
        where: { id: playerId },
        data: { inGameId: null },
      });
      return inGameId;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === PrismaError.RecordNotFound)
          throw new WsException('Cannot find the player in the game');
      }
    }
  }

  async updateTime(gameId: number, field: 'startedAt' | 'endedAt', date: Date) {
    try {
      const game = await this.prisma.game.update({
        where: { id: gameId },
        data: { [field]: date },
      });

      return game;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError)
        if (error.code === PrismaError.RecordNotFound)
          throw new WsException('Cannot update game with the given id');
      throw new WsException('Something went wrong');
    }
  }

  async countPlayersInGame(gameId: number) {
    const playersCount = await this.prisma.user.count({
      where: { inGameId: gameId },
    });
    return playersCount;
  }

  async removeIfEmpty(gameId: number) {
    try {
      const playersCount = await this.prisma.user.count({
        where: { inGameId: gameId },
      });
      const historiesCount = await this.prisma.gameHistory.count({
        where: { gameId },
      });
      const toBeDeleted = historiesCount === 0 && playersCount === 0;
      // if the game has ended, but everyone has left the game then don't delete the game
      if (toBeDeleted) await this.prisma.game.delete({ where: { id: gameId } });
      return toBeDeleted;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError)
        if (error.code === PrismaError.RecordNotFound)
          throw new WsException('Cannot delete game with the given id');
      throw new WsException('Something went wrong');
    }
  }

  async findById(id: number, user: User) {
    try {
      const game = await this.prisma.game.findUniqueOrThrow({
        where: { id, players: { some: { id: user.id } } },
      });
      return game;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError)
        if (error.code === PrismaError.RecordNotFound)
          throw new NotFoundException('Cannot find game with the given id');
      throw new NotFoundException('Something went wrong');
    }
  }

  private async checkPlayerAlreadyInGame(playerId: number) {
    const player = await this.usersService.findById(playerId);
    if (!player) throw new WsException('Player not found');
    if (player.inGameId)
      throw new ForbiddenException(
        'You are already in a game. Please leave the game before joining in another one',
      );
  }

  private async addPlayer(gameId: number, playerId: number) {
    try {
      await this.prisma.user.update({
        where: { id: playerId },
        data: { inGameId: gameId },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError)
        if (error.code === PrismaError.ForeignViolation)
          throw new WsException('Game not found');
      throw error;
    }
  }

  private async findOne(user: User) {
    const result = await this.prisma.$queryRaw<[] | [{ id: number }]>`
      SELECT g."id" FROM "Game" g
      LEFT JOIN "User" u
      ON u."inGameId" = g."id"
      WHERE g."minPoints" <= ${user.catPoints}
      AND g."maxPoints" >= ${user.catPoints}
      AND g."startedAt" IS NULL
      GROUP BY g."id"
      HAVING COUNT(u."id") < ${MAX_PLAYERS_COUNT}
      LIMIT 1;
    `;
    return result[0]?.id;
  }

  private async create(user: User) {
    const paragraph = generateParagraph();

    const game = await this.prisma.game.create({
      data: {
        minPoints: Math.max(user.catPoints - 250, 0),
        maxPoints: user.catPoints + 250,
        paragraph,
      },
    });
    return game.id;
  }
}
