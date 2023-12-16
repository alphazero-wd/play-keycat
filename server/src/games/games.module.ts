import { Module, forwardRef } from '@nestjs/common';
import { GamesService } from './games.service';
import { GamesGateway } from './games.gateway';
import { UsersModule } from '../users/users.module';
import { HistoriesModule } from '../histories/histories.module';
import { GamesController } from './games.controller';
import { GameTimersModule } from '../game-timers/game-timers.module';

@Module({
  imports: [UsersModule, GameTimersModule, HistoriesModule],
  controllers: [GamesController],
  providers: [GamesGateway, GamesService],
})
export class GamesModule {}
