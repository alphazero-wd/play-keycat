import {
  WebSocketGateway,
  OnGatewayDisconnect,
  WebSocketServer,
  SubscribeMessage,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { GamesService } from './games.service';
import { Server } from 'socket.io';
import { SocketUser } from '../common/types';
import { ParseIntPipe, UseGuards } from '@nestjs/common';
import { WsCookieAuthGuard } from '../auth/guards';
import { PlayerFinishedDto } from './dto';
import { HistoriesService } from '../histories/histories.service';

@WebSocketGateway()
export class GamesGateway implements OnGatewayDisconnect {
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
      await this.gamesService.startGame(gameId);
      this.io.sockets.to(`game:${gameId}`).emit('startGame');
    }

    this.io.sockets.to(`game:${gameId}`).emit('players', players);
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
    const players = await this.gamesService.getPlayersInGame(gameId);
    if (players.length === 0) await this.gamesService.removeIfEmpty(gameId);
    else {
      this.io.sockets.to(`game:${gameId}`).emit('players', players);
    }
  }
}
