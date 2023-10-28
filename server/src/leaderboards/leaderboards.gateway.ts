import { ParseIntPipe } from '@nestjs/common';
import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { LeaderboardsService } from './leaderboards.service';
import { Server } from 'socket.io';

@WebSocketGateway()
export class LeaderboardsGateway {
  @WebSocketServer() io: Server;

  constructor(private leaderboardsService: LeaderboardsService) {}

  @SubscribeMessage('getLeaderboard')
  async getLeaderboard(@MessageBody('offset', ParseIntPipe) offset: number) {
    const { topPlayers, topPlayersCount } =
      await this.leaderboardsService.findTop100Players(offset);
    this.io.sockets.emit('leaderboardUpdated', { topPlayers, topPlayersCount });
  }
}
