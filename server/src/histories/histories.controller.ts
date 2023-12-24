import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Query,
  UseGuards,
} from '@nestjs/common';
import { HistoriesService } from './histories.service';
import { CookieAuthGuard } from '../auth/guards';

@Controller()
export class HistoriesController {
  constructor(private historiesService: HistoriesService) {}

  @UseGuards(CookieAuthGuard)
  @Get('games/:id/history')
  async findByGame(@Param('id') gameId: string) {
    const gameHistories = await this.historiesService.findByGame(gameId);
    return gameHistories;
  }

  @Get('player/:username/histories')
  async findByPlayer(
    @Param('username') username: string,
    @Query('offset', ParseIntPipe) offset: number,
  ) {
    return this.historiesService.findByPlayer(username, offset);
  }
}
