import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateHistoryDto } from './dto/create-history.dto';
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

  async create({ playerId, ...createHistoryDto }: CreateHistoryDto) {
    try {
      const user = await this.usersService.findById(playerId);
      const gameHistory = this.prisma.gameHistory.create({
        data: { ...createHistoryDto, playerId, gameId: user.inGameId },
      });
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

  findByGame(gameId: number) {
    try {
      const game = this.prisma.game.findUniqueOrThrow({
        where: { id: gameId },
        include: {
          histories: {
            select: { timeTaken: true, wpm: true, acc: true, player: true },
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
}
