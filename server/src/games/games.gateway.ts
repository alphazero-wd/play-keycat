import { UseGuards } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { GameMode } from '@prisma/client';
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
      this.startCountdown(gameId, countdown, () => {
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
      if (interval) this.endGame(gameId);
    });
  }

  async endGame(gameId: number) {
    const game = await this.gamesService.updateTime(gameId, 'endedAt');
    this.io.sockets
      .to(`game:${gameId}`)
      .emit('endGame', { endedAt: game.endedAt.toISOString() });
    this.gameTimers.delete(`game:${gameId}`);
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
    const { players, mode, paragraph } = await this.gamesService.getDisplayInfo(
      gameId,
    );
    await this.gamesService.removePlayer(user.id);
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
        prevRank,
        currentRank,
      });

    if (hasLevelUp)
      socket.emit('levelUp', {
        currentLevel: player.currentLevel,
        xpsGained: player.xpsGained,
        xpsRequired: determineXPsRequired(player.currentLevel),
      });

    this.endGameEarly(gameId, mode, leftPlayersCount);
    this.io.sockets.emit('leaderboardUpdate');
  }

  async endGameEarly(gameId: number, mode: GameMode, leftPlayersCount: number) {
    const maxPlayersCount = determineMaxPlayersCount(mode);
    const playersFinishedCount =
      await this.historiesService.countPlayersFinished(gameId);
    if (playersFinishedCount !== maxPlayersCount - leftPlayersCount) return;
    this.endGame(gameId);
    this.stopCountdown(gameId);
  }

  async handleDisconnect(socket: SocketUser) {
    const currentUser = socket.request.user;
    if (!currentUser) return;
    const gameId = await this.gamesService.removePlayer(currentUser.id);

    if (!gameId) return;

    this.io.sockets.to(`game:${gameId}`).emit('playerLeft', {
      id: currentUser.id,
      username: currentUser.username,
    });

    const hasDeleted = await this.gamesService.removeIfEmpty(gameId);
    if (hasDeleted) this.stopCountdown(gameId);
  }
}
