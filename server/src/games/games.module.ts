import { Module } from '@nestjs/common';
import { GamesService } from './games.service';
import { GamesGateway } from './games.gateway';
import { UsersModule } from '../users/users.module';
import { HistoriesModule } from '../histories/histories.module';

@Module({
  imports: [UsersModule, HistoriesModule],
  providers: [GamesGateway, GamesService],
})
export class GamesModule {}
