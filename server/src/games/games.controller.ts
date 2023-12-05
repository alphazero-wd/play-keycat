import {
  Body,
  Controller,
  Get,
  InternalServerErrorException,
  NotFoundException,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { GamesService } from './games.service';
import { CookieAuthGuard } from '../auth/guards';
import { CurrentUser } from '../users/decorators';
import { Prisma, User } from '@prisma/client';
import { FindOrCreateGameDto } from './dto';
import { PrismaError } from '../prisma/prisma-error';

@Controller('games')
@UseGuards(CookieAuthGuard)
export class GamesController {
  constructor(private gamesService: GamesService) {}

  @Post('find')
  async findOrCreate(
    @CurrentUser() user: User,
    @Body() { gameMode }: FindOrCreateGameDto,
  ) {
    await this.gamesService.checkPlayerAlreadyInGame(user.id);
    let gameIdToJoin = await this.gamesService.findOne(user, gameMode);
    if (!gameIdToJoin)
      gameIdToJoin = await this.gamesService.create(user, gameMode);
    try {
      await this.gamesService.updateCurrentlyPlayingGame(user.id, gameIdToJoin);
      return gameIdToJoin;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === PrismaError.RecordNotFound)
          throw new NotFoundException('User not found');
        if (error.code === PrismaError.ForeignViolation)
          throw new NotFoundException('Game not found');
      }
      throw new InternalServerErrorException('Something went wrong');
    }
  }

  @Get(':id')
  async findById(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: User,
  ) {
    const game = await this.gamesService.findById(id, user.id);
    return game;
  }
}
