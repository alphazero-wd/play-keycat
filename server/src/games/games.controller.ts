import {
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

@Controller('games')
export class GamesController {
  constructor(private gamesService: GamesService) {}

  @UseGuards(CookieAuthGuard)
  @Post('join')
  async join(@CurrentUser() user: User) {
    const gameId = await this.gamesService.join(user);
    return gameId;
  }

  @Get(':id')
  async findById(@Param('id', ParseIntPipe) id: number) {
    const game = await this.gamesService.findById(id);
    return game;
  }
}
