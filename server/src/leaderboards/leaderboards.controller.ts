import { Controller, Get, ParseIntPipe, Query } from '@nestjs/common';
import { LeaderboardsService } from './leaderboards.service';

@Controller('leaderboards')
export class LeaderboardsController {
  constructor(private leaderboardsService: LeaderboardsService) {}

  @Get('players')
  getPlayersLeaderboard(@Query('offset', ParseIntPipe) offset: number) {
    return this.leaderboardsService.findTop100Players(offset);
  }

  @Get('games')
  getGamesLeaderboard(@Query('offset', ParseIntPipe) offset: number) {
    return this.leaderboardsService.findTop100Players(offset);
  }
}
