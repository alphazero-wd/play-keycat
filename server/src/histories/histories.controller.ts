import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { HistoriesService } from './histories.service';

@Controller()
export class HistoriesController {
  constructor(private historiesService: HistoriesService) {}

  @Get('games/:id/history')
  async findByGame(@Param('id', ParseIntPipe) gameId: number) {
    const gameHistories = await this.historiesService.findByGame(gameId);
    return gameHistories;
  }

  @Get('player/:username/histories')
  async findPlayerHistories(
    @Param('username') username: string,
    @Query('offset', ParseIntPipe) offset: number,
  ) {
    const { playerHistories, playerHistoriesCount } =
      await this.historiesService.findByPlayer(username, offset);
    return { playerHistories, playerHistoriesCount };
  }
}
