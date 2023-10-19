import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GameStatus, Prisma, User } from '@prisma/client';
import { PrismaError } from '../prisma/prisma-error';
import { WsException } from '@nestjs/websockets';
import { UsersService } from '../users/users.service';

@Injectable()
export class GamesService {
  constructor(
    private prisma: PrismaService,
    private usersService: UsersService,
  ) {}

  async join(user: User) {
    let gameIdToJoin = await this.findOne(user);
    if (!gameIdToJoin) gameIdToJoin = await this.create(user);
    await this.addPlayer(gameIdToJoin, user.id);
    return gameIdToJoin;
  }

  async getPlayersInGame(gameId: number) {
    const { players } = await this.prisma.game.findUnique({
      where: { id: gameId },
      include: { players: true },
    });
    return players;
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

  async removeIfEmpty(gameId: number) {
    await this.prisma.game.delete({ where: { id: gameId } });
  }

  async findById(id: number) {
    try {
      const game = await this.prisma.game.findUniqueOrThrow({ where: { id } });
      return game;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError)
        if (error.code === PrismaError.RecordNotFound)
          throw new NotFoundException('Cannot find game with the given id');
      throw new InternalServerErrorException('Something went wrong');
    }
  }

  private async checkPlayerAlreadyInGame(playerId: number) {
    const player = await this.usersService.findById(playerId);
    if (!player) throw new WsException('Player not found');
    if (player.inGameId)
      throw new WsException(
        'You are already in a game. Please leave the game before joining in another room',
      );
  }

  private async addPlayer(gameId: number, playerId: number) {
    try {
      await this.checkPlayerAlreadyInGame(playerId);
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
    const idealGame = await this.prisma.game.findFirst({
      where: {
        minPoints: { lte: user.keycatPoints },
        maxPoints: { gte: user.keycatPoints },
        status: GameStatus.LOBBY,
      },
      select: { id: true, _count: { select: { players: true } } },
    });

    return idealGame && idealGame._count.players < 3 ? idealGame.id : null;
  }

  private async create(user: User) {
    const paragraph =
      'Green vines attached to the trunk of the tree had wound themselves toward the top of the canopy. Ants used the vine as their private highway, avoiding all the creases and crags of the bark, to freely move at top speed from top to bottom or bottom to top depending on their current chore.';
    const timeLimit = Math.trunc((paragraph.length / 5 / 39) * 60);
    const game = await this.prisma.game.create({
      data: {
        minPoints: Math.max(user.keycatPoints - 200, 0),
        maxPoints: Math.max(user.keycatPoints + 200, 0),
        paragraph,
        timeLimit,
      },
    });
    return game.id;
  }
}
