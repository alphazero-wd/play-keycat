import { Module } from '@nestjs/common';
import { GamesService } from './games.service';
import { GamesGateway } from './games.gateway';
import { UsersModule } from '../users/users.module';
import { HistoriesModule } from '../histories/histories.module';
import { GamesController } from './games.controller';

@Module({
  imports: [UsersModule, HistoriesModule],
  controllers: [GamesController],
  providers: [GamesGateway, GamesService],
})
export class GamesModule {}
