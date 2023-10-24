import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { HistoriesService } from './histories.service';

@Controller()
export class HistoriesController {
  constructor(private historiesService: HistoriesService) {}

  @Get('games/:id/history')
  async findByGame(@Param('id', ParseIntPipe) gameId: number) {
    const gameHistories = await this.historiesService.findByGame(gameId);
    return gameHistories;
  }
}
