import { Module } from '@nestjs/common';
import { HistoriesService } from './histories.service';
import { UsersModule } from '../users/users.module';
import { HistoriesController } from './histories.controller';

@Module({
  imports: [UsersModule],
  controllers: [HistoriesController],
  providers: [HistoriesService],
  exports: [HistoriesService],
})
export class HistoriesModule {}
