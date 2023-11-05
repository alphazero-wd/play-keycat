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
    socket.join(`game:${gameId}`);
    const players = await this.gamesService.getPlayersInGame(gameId);

    if (players.length === 3) {
      const averageCPs = calculateAverageCPs(players);
      this.startCountdown(gameId, 10, async () => {
        const game = await this.gamesService.updateTime(gameId, 'startedAt');
        this.startTimeLimit(
          gameId,
          calculateTimeLimit(averageCPs, game.paragraph),
        );
        this.io.sockets
          .to(`game:${gameId}`)
          .emit('startGame', { startedAt: game.startedAt.toISOString() });
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
    await this.historiesService.create(payload, user);
    this.io.sockets.emit('leaderboardUpdate');
  }

  async handleDisconnect(socket: SocketUser) {
    const currentUser = socket.request.user;
    if (!currentUser) return;
    const gameId = await this.gamesService.removePlayer(currentUser.id);

    // check for `gameId` because a player might join in on multiple devices causes NestJS to raise an uncanny exception
    if (!gameId) return;

    const playersInGameCount = await this.gamesService.countPlayersInGame(
      gameId,
    );
    if (playersInGameCount === 0) {
      await this.gamesService.removeIfEmpty(gameId);
      clearInterval(this.gameTimers.get(`game:${gameId}`));
      this.gameTimers.delete(`game:${gameId}`);
    }
  }
}
