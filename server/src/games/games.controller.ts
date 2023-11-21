import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { GamesService } from './games.service';
import { CookieAuthGuard } from '../auth/guards';
import { CurrentUser } from '../users/decorators';
import { User } from '@prisma/client';
import { FindOrCreateGameDto } from './dto';

@Controller('games')
@UseGuards(CookieAuthGuard)
export class GamesController {
  constructor(private gamesService: GamesService) {}

  @Post('find')
  async findOrCreate(
    @CurrentUser() user: User,
    @Body() findOrCreateGameDto: FindOrCreateGameDto,
  ) {
    const gameId = await this.gamesService.findOrCreate(
      user,
      findOrCreateGameDto,
    );
    return gameId;
  }

  @Get(':id')
  async findById(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: User,
  ) {
    const game = await this.gamesService.findById(id, user);
    return game;
  }
}
