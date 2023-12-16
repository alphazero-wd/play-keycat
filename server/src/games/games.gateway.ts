import { UseGuards } from '@nestjs/common';
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
import { getCurrentRank } from '../ranks';
import { determineXPsRequired } from '../xps';
import { PlayerFinishedDto, PlayerProgressDto } from './dto';
import { GamesService } from './games.service';
import {
  addSeconds,
  calculateAverageCPs,
  calculateTimeLimit,
  determineCountdown,
  determineMaxPlayersCount,
} from './utils';
import { GameTimersService } from '../game-timers/game-timers.service';
import { GameMode } from '@prisma/client';

@WebSocketGateway()
export class GamesGateway implements OnGatewayDisconnect {
  constructor(
    private readonly gamesService: GamesService,
    private readonly gameTimersService: GameTimersService,
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
    const { players, mode } = await this.gamesService.getDisplayInfo(gameId);

    const maxPlayersCount = determineMaxPlayersCount(mode);
    const countdown = determineCountdown(mode);

    if (players.length === maxPlayersCount) {
      const averageCPs = calculateAverageCPs(players);
      const game = await this.gamesService.updateTime(
        gameId,
        'startedAt',
        addSeconds(countdown),
      );
      this.gameTimersService.startCountdown(this.io, gameId, countdown, () => {
        const timeLimit = calculateTimeLimit(averageCPs, game.paragraph);
        this.io.sockets
          .to(`game:${gameId}`)
          .emit('startGame', { startedAt: game.startedAt.toISOString() });
        this.io.sockets.to(`game:${gameId}`).emit('countdown', timeLimit);
        this.startTimeLimit(gameId, timeLimit - 1);
      });
    }
    this.io.sockets.to(`game:${gameId}`).emit('players', players);
  }

  @UseGuards(WsCookieAuthGuard)
  @SubscribeMessage('progress')
  async reflectProgress(
    @ConnectedSocket() socket: SocketUser,
    @MessageBody() { gameId, wpm, progress }: PlayerProgressDto,
  ) {
    const user = socket.request.user;
    this.io.sockets
      .to(`game:${gameId}`)
      .emit('playerProgress', { id: user.id, wpm, progress });
  }

  @UseGuards(WsCookieAuthGuard)
  @SubscribeMessage('playerFinished')
  async onPlayerFinished(
    @ConnectedSocket() socket: SocketUser,
    @MessageBody() { gameId, leftPlayersCount, ...payload }: PlayerFinishedDto,
  ) {
    const user = socket.request.user;
    const { mode, paragraph, players } = await this.gamesService.getDisplayInfo(
      gameId,
    );
    await this.gamesService.updateCurrentlyPlayingGame(user.id, null);
    const { hasLevelUp, history, player, xpsBonus } =
      await this.historiesService.create(
        { ...payload, gameId },
        mode,
        getCurrentRank(calculateAverageCPs(players)),
        paragraph,
        user,
      );

    const { prevRank, currentRank, rankUpdateStatus } =
      this.historiesService.checkRankUpdate(user, history.catPoints);

    socket.emit('gameSummary', {
      wpm: payload.wpm,
      acc: payload.acc,
      position: payload.position,
      catPoints: history.catPoints,
      totalXPsBonus: xpsBonus,
      newXPsGained: player.xpsGained,
    });

    this.io.sockets
      .to(`game:${gameId}`)
      .emit('updatePosition', { id: player.id, position: payload.position });

    if (prevRank !== currentRank)
      socket.emit('rankUpdate', {
        status: rankUpdateStatus,
        currentRank,
      });

    if (hasLevelUp)
      socket.emit('levelUp', {
        currentLevel: player.currentLevel,
        xpsGained: player.xpsGained,
        xpsRequired: determineXPsRequired(player.currentLevel),
      });

    this.io.sockets.emit('leaderboardUpdate');
  }

  async handleDisconnect(socket: SocketUser) {
    const currentUser = socket.request.user;
    if (!currentUser) return;
    await this.gamesService.updateCurrentlyPlayingGame(currentUser.id, null);

    this.io.sockets.to(`game:${currentUser.inGameId}`).emit('playerLeft', {
      id: currentUser.id,
      username: currentUser.username,
    });

    const playersCount = await this.gamesService.removeIfEmpty(
      currentUser.inGameId,
    );
    if (playersCount === 0) this.endGame(currentUser.inGameId);
  }

  private async endGame(gameId: number) {
    const game = await this.gamesService.updateTime(gameId, 'endedAt');
    this.io.sockets
      .to(`game:${gameId}`)
      .emit('endGame', { endedAt: game.endedAt.toISOString() });
  }

  private startTimeLimit(gameId: number, countdown: number) {
    this.gameTimersService.startCountdown(
      this.io,
      gameId,
      countdown,
      async () => {
        await this.endGame(gameId);
      },
    );
  }
}
