import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import * as Joi from '@hapi/joi';
import { PrismaModule } from './prisma/prisma.module';
import { GamesModule } from './games/games.module';
import { HistoriesModule } from './histories/histories.module';
import { LeaderboardsModule } from './leaderboards/leaderboards.module';
import { GameTimersModule } from './game-timers/game-timers.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        DATABASE_URL: Joi.string().uri().required(),
        REDIS_URL: Joi.string().uri().required(),
        SESSION_SECRET: Joi.string().required(),
        CORS_ORIGIN: Joi.string().uri().required(),
      }),
    }),
    UsersModule,
    AuthModule,
    PrismaModule,
    GamesModule,
    HistoriesModule,
    LeaderboardsModule,
    GameTimersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
