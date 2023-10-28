import { Module } from '@nestjs/common';
import { LeaderboardsService } from './leaderboards.service';
import { LeaderboardsGateway } from './leaderboards.gateway';

@Module({
  providers: [LeaderboardsService, LeaderboardsGateway],
})
export class LeaderboardsModule {}
