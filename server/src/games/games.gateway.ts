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
import { UsersService } from '../users/users.service';

@WebSocketGateway()
export class GamesGateway implements OnGatewayDisconnect {
  constructor(
    private readonly gamesService: GamesService,
    private readonly historiesService: HistoriesService,
    private readonly usersService: UsersService,
  ) {}

  @WebSocketServer() io: Server;

  @UseGuards(WsCookieAuthGuard)
  @SubscribeMessage('joinGame')
  async joinGame(@ConnectedSocket() socket: SocketUser) {
    const user = socket.request.user;
    const gameId = await this.gamesService.join(user);
    socket.join(`game:${gameId}`);
    const { players } = await this.gamesService.getPlayersInGame(gameId);

    if (players.length === 3) {
      const game = await this.gamesService.startGame(gameId);
      this.io.sockets.to(`game:${gameId}`).emit('startGame', game);
    }

    this.io.sockets.to(`game:${gameId}`).emit('players', players);
  }

  @UseGuards(WsCookieAuthGuard)
  @SubscribeMessage('progress')
  async reflectProgress(
    @ConnectedSocket() socket: SocketUser,
    @MessageBody('progress', ParseIntPipe) progress: number,
  ) {
    const user = await this.usersService.findById(socket.request.user.id);
    this.io.sockets
      .to(`game:${user.inGameId}`)
      .emit('playerProgress', { id: user.id, progress });
  }

  @UseGuards(WsCookieAuthGuard)
  @SubscribeMessage('playerFinished')
  async onPlayerFinished(
    @ConnectedSocket() socket: SocketUser,
    @MessageBody() { wpm, acc, timeTaken, catPoints }: PlayerFinishedDto,
  ) {
    const user = await this.usersService.findById(socket.request.user.id);
    await this.usersService.update(user.id, {
      catPoints: Math.max(0, user.catPoints + catPoints),
    });
    await this.historiesService.create({
      acc,
      wpm,
      timeTaken,
      playerId: user.id,
    });
  }

  async handleDisconnect(socket: SocketUser) {
    const currentUser = socket.request.user;
    if (!currentUser) return;
    const gameId = await this.gamesService.removePlayer(currentUser.id);

    // check for `gameId` because a player might join in on multiple devices causes NestJS to raise an uncanny exception
    if (!gameId) return;
    const { players } = await this.gamesService.getPlayersInGame(gameId);
    if (players.length === 0) await this.gamesService.removeIfEmpty(gameId);
    else {
      this.io.sockets.to(`game:${gameId}`).emit('players', players);
    }
  }
}
