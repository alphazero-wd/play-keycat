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
import { PlayerFinishedDto, PlayerProgressDto } from './dto';
import { GamesService } from './games.service';
import { addSeconds, calculateTimeLimit, determineBasedOnMode } from './utils';
import { calculateAverageCPs, getCurrentRank } from '../ranks';
import { GameMode } from '@prisma/client';
import { calculateXPs } from '../histories/utils';
import { determineXPsRequired } from '../users/utils';

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
    const { countdown, maxPlayersCount } = determineBasedOnMode(mode);

    if (players.length === maxPlayersCount) {
      const averageCPs = calculateAverageCPs(players.map((p) => p.catPoints));
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
    @MessageBody() { gameId, ...payload }: PlayerFinishedDto,
    @MessageBody('leftPlayersCount', ParseIntPipe) leftPlayersCount: number,
  ) {
    const user = socket.request.user;
    const { players, mode, paragraph } = await this.gamesService.getDisplayInfo(
      gameId,
    );
    await this.gamesService.removePlayer(user.id);
    const xpsBonus =
      mode !== GameMode.PRACTICE ? calculateXPs(payload, paragraph) : 0;

    const averageCPs = calculateAverageCPs(players.map((p) => p.catPoints));
    const { hasLevelUp, history, player } = await this.historiesService.create(
      { ...payload, gameId },
      mode,
      getCurrentRank(averageCPs),
      xpsBonus,
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
    /* end early if all involved players have finished the game
      - 5 players total: 2 AFKs, 2 finished, 1 unfinished
      - check if players finished aka histories count = MAX_PLAYERS - leftPlayersCount
    */
    const { maxPlayersCount } = determineBasedOnMode(mode);
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

    // check for `gameId` because a player might join in on multiple devices causes NestJS to raise an uncanny exception
    if (!gameId) return;

    this.io.sockets.to(`game:${gameId}`).emit('playerLeft', {
      id: currentUser.id,
      username: currentUser.username,
    });

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
