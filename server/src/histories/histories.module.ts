import { Module } from '@nestjs/common';
import { HistoriesService } from './histories.service';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [UsersModule],
  providers: [HistoriesService],
  exports: [HistoriesService],
})
export class HistoriesModule {}
