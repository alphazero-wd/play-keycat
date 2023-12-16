import { Module } from '@nestjs/common';
import { GameTimersService } from './game-timers.service';

@Module({
  imports: [],
  providers: [GameTimersService],
  exports: [GameTimersService],
})
export class GameTimersModule {}
