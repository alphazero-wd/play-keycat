import {
  WebSocketGateway,
  OnGatewayDisconnect,
  WebSocketServer,
  SubscribeMessage,
  ConnectedSocket,
} from '@nestjs/websockets';
import { GamesService } from './games.service';
import { Server } from 'socket.io';
import { SocketUser } from '../common/types';
import { UseGuards } from '@nestjs/common';
import { WsCookieAuthGuard } from '../auth/guards';
import { GameStatus } from '@prisma/client';

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
    const { players } = await this.gamesService.getPlayersInGame(gameId);

    if (players.length === 3) {
      const game = await this.gamesService.updateGameStatus(
        gameId,
        GameStatus.PLAYING,
      );
      this.io.sockets.to(`game:${gameId}`).emit('startGame', game);
    }

    this.io.sockets.to(`game:${gameId}`).emit('players', players);
  }

  async handleDisconnect(socket: SocketUser) {
    const currentUser = socket.request.user;
    if (!currentUser) return;
    const gameId = await this.gamesService.removePlayer(currentUser.id);
    const { players, status } = await this.gamesService.getPlayersInGame(
      gameId,
    );
    if (players.length === 0 && status !== GameStatus.ENDED)
      await this.gamesService.removeIfEmpty(gameId);
    else this.io.sockets.to(`game:${gameId}`).emit('players', players);
  }
}
