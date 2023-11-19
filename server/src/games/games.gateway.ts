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
import { addSeconds, calculateTimeLimit } from './utils';
import { calculateAverageCPs } from '../ranks';
import { MAX_PLAYERS_COUNT, MULTIPLAYERS_COUNTDOWN } from '../common/constants';

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

    if (players.length === MAX_PLAYERS_COUNT) {
      const averageCPs = calculateAverageCPs(players.map((p) => p.catPoints));
      const game = await this.gamesService.updateTime(
        gameId,
        'startedAt',
        addSeconds(MULTIPLAYERS_COUNTDOWN),
      );
      this.startCountdown(gameId, MULTIPLAYERS_COUNTDOWN, () => {
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
    const game = await this.gamesService.updateTime(
      gameId,
      'endedAt',
      new Date(),
    );
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
    @MessageBody() payload: PlayerFinishedDto,
    @MessageBody('leftPlayersCount', ParseIntPipe) leftPlayersCount: number,
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
    this.endGameEarly(payload.gameId, leftPlayersCount);
    this.io.sockets.emit('leaderboardUpdate');
  }

  async endGameEarly(gameId: number, leftPlayersCount: number) {
    /* end early if all involved players have finished the game
      - 5 players total: 2 AFKs, 2 finished, 1 unfinished
      - check if players finished aka histories count = MAX_PLAYERS - leftPlayersCount
    */
    const playersFinishedCount =
      await this.historiesService.countPlayersFinished(gameId);
    if (playersFinishedCount !== MAX_PLAYERS_COUNT - leftPlayersCount) return;
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
