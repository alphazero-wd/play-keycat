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
    @MessageBody('gameId') gameId: number,
  ) {
    socket.join(`game:${gameId}`);
    const { players } = await this.gamesService.getPlayersInGame(gameId);

    if (players.length === 2) {
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

  stopCountdown(gameId: number) {
    clearInterval(this.gameTimers.get(`game:${gameId}`));
    this.gameTimers.delete(`game:${gameId}`);
  }

  startTimeLimit(gameId: number, countdown: number) {
    this.startCountdown(gameId, countdown, async () => {
      // end game here
      const interval = this.gameTimers.get(`game:${gameId}`);
      if (!interval) return;
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
    await this.gamesService.removePlayer(user.id);
    const [player, history] = await this.historiesService.create(
      payload,
      averageCPs,
      user,
    );
    const { prevRank, currentRank, rankUpdateStatus } =
      this.historiesService.checkRankUpdate(player, history.catPoints);
    socket.emit('gameSummary', {
      wpm: payload.wpm,
      acc: payload.acc,
      position: payload.position,
      catPoints: history.catPoints,
    });
    this.io.sockets
      .to(`game:${payload.gameId}`)
      .emit('updatePosition', { id: player.id, position: payload.position });
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
      const hasDeleted = await this.gamesService.removeIfEmpty(gameId);
      /*
        Suppose all players in a game left, there are 2 possible cases:
        If there are no associated histories, we'll delete the time ref.
        Otherwise, we might not want to delete the time ref.
        =====> The role of the time ref is to check if a game is currently underway OR has been dissolved
        After which we can officially end the game (if exists)
      */
      if (hasDeleted) this.stopCountdown(gameId);
    }
  }
}
