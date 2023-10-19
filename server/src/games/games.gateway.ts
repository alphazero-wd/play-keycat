import {
  WebSocketGateway,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketServer,
  WsException,
  SubscribeMessage,
  ConnectedSocket,
} from '@nestjs/websockets';
import { GamesService } from './games.service';
import { Server } from 'socket.io';
import { SocketUser } from '../common/types';
import { UseGuards } from '@nestjs/common';
import { WsCookieAuthGuard } from '../auth/guards';

@WebSocketGateway()
@UseGuards(WsCookieAuthGuard)
export class GamesGateway implements OnGatewayDisconnect {
  constructor(private readonly gamesService: GamesService) {}

  @WebSocketServer() io: Server;

  @SubscribeMessage('joinGame')
  async joinGame(@ConnectedSocket() socket: SocketUser) {
    const user = socket.request.user;
    const gameId = await this.gamesService.join(user);
    socket.join(`game:${gameId}`);
    const players = await this.gamesService.getPlayersInGame(gameId);
    this.io.sockets.to(`game:${gameId}`).emit('players', players);
  }

  async handleDisconnect(socket: SocketUser) {
    const currentUser = socket.request.user;
    if (!currentUser) return;
    const gameId = await this.gamesService.removePlayer(currentUser.id);
    const remainingPlayers = await this.gamesService.getPlayersInGame(gameId);
    if (remainingPlayers.length === 0)
      await this.gamesService.removeIfEmpty(gameId);
    this.io.sockets.to(`game:${gameId}`).emit('players', remainingPlayers);
  }
}
