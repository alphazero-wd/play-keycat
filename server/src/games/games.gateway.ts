import { ParseIntPipe, UseGuards } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { WsCookieAuthGuard } from '../auth/guards';
import { SocketUser } from '../common/types';
import { HistoriesService } from '../histories/histories.service';
import { PlayerFinishedDto } from './dto';
import { GamesService } from './games.service';
import { calculateTimeLimit } from './utils';
import { calculateAverageCPs } from '../ranks';
import { MULTIPLAYERS_COUNTDOWN } from '../common/constants';

@WebSocketGateway()
export class GamesGateway implements OnGatewayDisconnect {
  private readonly gameTimers: Map<string, NodeJS.Timeout> = new Map();
  constructor(
    private readonly gamesService: GamesService,
    private readonly historiesService: HistoriesService,
  ) {}

  @WebSocketServer() io: Server;

  @UseGuards(WsCookieAuthGuard)
  @SubscribeMessage('joinGame')
  async joinGame(
    @ConnectedSocket() socket: SocketUser,
    @MessageBody('gameId', ParseIntPipe) gameId: number,
  ) {
    await socket.join(`game:${gameId}`);
    const { players } = await this.gamesService.getPlayersInGame(gameId);
    console.log({ user: socket.request.user, players });

    if (players.length === 3) {
      const averageCPs = calculateAverageCPs(players.map((p) => p.catPoints));
      this.io.sockets
        .to(`game:${gameId}`)
        .emit('countdown', MULTIPLAYERS_COUNTDOWN);

      this.startCountdown(gameId, MULTIPLAYERS_COUNTDOWN - 1, () => {
        setTimeout(async () => {
          const game = await this.gamesService.updateTime(gameId, 'startedAt');
          const timeLimit = calculateTimeLimit(averageCPs, game.paragraph);
          this.io.sockets
            .to(`game:${gameId}`)
            .emit('startGame', { startedAt: game.startedAt.toISOString() });
          this.io.sockets.to(`game:${gameId}`).emit('countdown', timeLimit);
          this.startTimeLimit(gameId, timeLimit - 1);
        }, 500);
      });
    }
    this.io.sockets.to(`game:${gameId}`).emit('players', players);
  }

  startCountdown(
    gameId: number,
    countdown: number,
    callback: CallableFunction,
  ) {
    const interval = setInterval(() => {
      this.io.sockets.to(`game:${gameId}`).emit('countdown', countdown);
      if (countdown === 0) {
        clearInterval(interval);
        callback();
      } else {
        countdown--;
      }
    }, 1000);
    this.gameTimers.set(`game:${gameId}`, interval);
  }

  startTimeLimit(gameId: number, countdown: number) {
    this.startCountdown(gameId, countdown, async () => {
      // end game here
      const game = await this.gamesService.updateTime(gameId, 'endedAt');
      this.io.sockets
        .to(`game:${gameId}`)
        .emit('endGame', { endedAt: game.endedAt.toISOString() });
      this.gameTimers.delete(`game:${gameId}`);
    });
  }

  @UseGuards(WsCookieAuthGuard)
  @SubscribeMessage('progress')
  async reflectProgress(
    @ConnectedSocket() socket: SocketUser,
    @MessageBody('progress', ParseIntPipe) progress: number,
    @MessageBody('gameId', ParseIntPipe) gameId: number,
  ) {
    const user = socket.request.user;
    this.io.sockets
      .to(`game:${gameId}`)
      .emit('playerProgress', { id: user.id, progress });
  }

  @UseGuards(WsCookieAuthGuard)
  @SubscribeMessage('playerFinished')
  async onPlayerFinished(
    @ConnectedSocket() socket: SocketUser,
    @MessageBody() payload: PlayerFinishedDto,
  ) {
    const user = socket.request.user;
    const { players } = await this.gamesService.getPlayersInGame(
      payload.gameId,
    );
    const averageCPs = calculateAverageCPs(players.map((p) => p.catPoints));
    const [player, history] = await this.historiesService.create(
      payload,
      averageCPs,
      user,
    );
    const { prevRank, currentRank, rankUpdateStatus } =
      this.historiesService.checkRankUpdate(player, history.catPoints);
    if (prevRank !== currentRank)
      socket.emit('rankUpdate', {
        status: rankUpdateStatus,
        prevRank,
        currentRank,
      });
    this.io.sockets.emit('leaderboardUpdate');
  }

  async handleDisconnect(socket: SocketUser) {
    const currentUser = socket.request.user;
    if (!currentUser) return;
    const gameId = await this.gamesService.removePlayer(currentUser.id);

    // check for `gameId` because a player might join in on multiple devices causes NestJS to raise an uncanny exception
    if (!gameId) return;

    const { players, startedAt } = await this.gamesService.getPlayersInGame(
      gameId,
    );

    if (!startedAt) {
      this.io.sockets.to(`game:${gameId}`).emit('players', players);
      this.io.sockets.to(`game:${gameId}`).emit('resetCountdown');
      clearInterval(this.gameTimers.get(`game:${gameId}`));
    } else {
      /*
        when the game has started, we don't want to announce any players who've left the game
        we still assume that they're "ghost" players, so it's easier to calculate ranking
      */
      this.io.sockets.to(`game:${gameId}`).emit('playerLeft', {
        id: currentUser.id,
        username: currentUser.username,
      });
    }

    if (players.length === 0) {
      await this.gamesService.removeIfEmpty(gameId);
      clearInterval(this.gameTimers.get(`game:${gameId}`));
      this.gameTimers.delete(`game:${gameId}`);
    }
  }
}
