import { Test, TestingModule } from '@nestjs/testing';
import { GamesGateway } from './games.gateway';
import { GamesService } from './games.service';
import { GameTimersService } from '../game-timers/game-timers.service';
import { HistoriesService } from '../histories/histories.service';
import { Game, GameHistory, GameMode, User } from '@prisma/client';
import { userFixture } from '../users/test-utils';
import { gameFixture } from './test-utils';
import { Server } from 'socket.io';
import { SocketUser } from '../common/types';
import {
  calculateAverageCPs,
  calculateTimeLimit,
  determineCountdown,
  determineMaxPlayersCount,
} from './utils';
import { faker } from '@faker-js/faker';
import { PlayerFinishedDto } from './dto';
import { historyFixture } from '../histories/test-utils';
import { RankUpdateStatus, getCurrentRank } from '../ranks';
import { determineXPsRequired } from '../xps';

jest.useFakeTimers();
jest.spyOn(global, 'setInterval');

describe('GamesGateway', () => {
  let gateway: GamesGateway;
  let gamesService: GamesService;
  let historiesService: HistoriesService;
  let user: User;
  let game: Game;
  let socket: SocketUser;
  let io: Server;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GamesGateway,
        GameTimersService,
        {
          provide: GamesService,
          useValue: {
            countPlayersInGame: jest.fn(),
            getDisplayInfo: jest.fn(),
            updateTime: jest.fn(),
            updateCurrentlyPlayingGame: jest.fn(),
            removeIfEmpty: jest.fn(),
          },
        },
        {
          provide: HistoriesService,
          useValue: {
            create: jest.fn(),
            countPlayersFinished: jest.fn(),
          },
        },
      ],
    }).compile();

    gateway = module.get<GamesGateway>(GamesGateway);
    gamesService = module.get<GamesService>(GamesService);
    historiesService = module.get<HistoriesService>(HistoriesService);
    game = gameFixture();
    user = userFixture({ inGameId: game.id });
    socket = {
      join: jest.fn(),
      emit: jest.fn(),
      request: { user },
    } as unknown as SocketUser;
    io = {
      sockets: {
        to: jest.fn().mockReturnValue({
          emit: jest.fn(),
        }),
        emit: jest.fn(),
      },
    } as unknown as Server;
    gateway.io = io;
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });

  describe('joinGame', () => {
    beforeEach(() => {
      jest.spyOn(gamesService, 'updateTime').mockResolvedValue(game);
    });

    describe('regardless of the game mode', () => {
      it('should broadcast the players in-game', async () => {
        const players = [user, userFixture()];
        jest.spyOn(gamesService, 'getDisplayInfo').mockResolvedValue({
          players,
          paragraph: game.paragraph,
          mode: GameMode.RANKED,
        });
        await gateway.joinGame(socket, game.id);
        expect(
          gateway.io.sockets.to(`game:${game.id}`).emit,
        ).toHaveBeenLastCalledWith('players', players);
      });

      it('should broadcast the countdown to all players in a game', async () => {
        jest.spyOn(gamesService, 'getDisplayInfo').mockResolvedValueOnce({
          players: [user, userFixture()],
          paragraph: game.paragraph,
          mode: GameMode.RANKED,
        });
        const countdown = determineCountdown(GameMode.RANKED);
        await gateway.joinGame(socket, game.id);
        expect(gamesService.updateTime).toHaveBeenCalledTimes(1);
        expect(gamesService.updateTime).toHaveBeenCalledWith(
          game.id,
          'startedAt',
          countdown,
        );
        jest.advanceTimersByTime(countdown * 1000);
        expect(
          gateway.io.sockets.to(`game:${game.id}`).emit,
        ).toHaveBeenCalledTimes(countdown + 1);
      });

      it('should broadcast to all players in a game the time remaining', async () => {
        const players: User[] = [user, userFixture()];
        const paragraph = game.paragraph;
        jest.spyOn(gamesService, 'getDisplayInfo').mockResolvedValueOnce({
          players,
          paragraph,
          mode: GameMode.CASUAL,
        });
        const countdown = determineCountdown(GameMode.RANKED);
        const averageCPs = calculateAverageCPs(players);
        const timeLimit = calculateTimeLimit(averageCPs, paragraph);
        await gateway.joinGame(socket, game.id);
        jest.advanceTimersByTime((countdown + timeLimit) * 1000);
        /*
          first countdown: (3 or 10) + 1
          time limit:      timeLimit + 1
          players:         +1
          => +3
        */
        expect(
          gateway.io.sockets.to(`game:${game.id}`).emit,
        ).toHaveBeenCalledTimes(countdown + timeLimit + 3);
      });

      it('should end game after the time limit is over', async () => {
        const players: User[] = [user, userFixture()];
        const paragraph = game.paragraph;
        jest.spyOn(gamesService, 'getDisplayInfo').mockResolvedValueOnce({
          players,
          paragraph,
          mode: GameMode.CASUAL,
        });
        const countdown = determineCountdown(GameMode.RANKED);
        const averageCPs = calculateAverageCPs(players);
        const timeLimit = calculateTimeLimit(averageCPs, paragraph);
        await gateway.joinGame(socket, game.id);
        jest.advanceTimersByTime((countdown + timeLimit + 1) * 1000);
        expect(gamesService.updateTime).toHaveBeenLastCalledWith(
          game.id,
          'endedAt',
        );
      });
    });

    describe('and game mode is PRACTICE', () => {
      it('should broadcast a short countdown if there is 1 player in practice mode', async () => {
        const paragraph = game.paragraph;
        jest.spyOn(gamesService, 'getDisplayInfo').mockResolvedValueOnce({
          players: [user],
          paragraph,
          mode: GameMode.PRACTICE,
        });
        const countdown = determineCountdown(GameMode.PRACTICE);
        await gateway.joinGame(socket, game.id);
        expect(gamesService.updateTime).toHaveBeenCalledTimes(1);
        expect(gamesService.updateTime).toHaveBeenCalledWith(
          game.id,
          'startedAt',
          countdown,
        );
        jest.advanceTimersByTime(countdown * 1000);
        expect(
          gateway.io.sockets.to(`game:${game.id}`).emit,
        ).toHaveBeenCalledTimes(countdown + 1);
      });
    });

    describe('and game mode is RANKED or CASUAL', () => {
      it('should not start the countdown if there are not enough players', async () => {
        jest.spyOn(gamesService, 'getDisplayInfo').mockResolvedValueOnce({
          players: [user],
          paragraph: game.paragraph,
          mode: GameMode.RANKED,
        });
        expect(
          gateway.io.sockets.to(`game:${game.id}`).emit,
        ).toHaveBeenCalledTimes(0);
        expect(gamesService.updateTime).not.toHaveBeenCalled();
      });
    });
  });

  describe('reflectProgress', () => {
    it('should broadcast the progress to all players in a game', () => {
      const gameId = game.id;
      const wpm = faker.number.int({ min: 0, max: 200 });
      const progress = faker.number.float({ min: 0.1, max: 100 });
      gateway.reflectProgress(socket, { gameId, wpm, progress });
      expect(gateway.io.sockets.to(`game:${gameId}`).emit).toHaveBeenCalledWith(
        'playerProgress',
        {
          id: user.id,
          progress,
          wpm,
        },
      );
    });
  });

  describe('playerFinished', () => {
    let payload: PlayerFinishedDto;
    let history: GameHistory;
    let saveHistoryResult: Awaited<ReturnType<HistoriesService['create']>>;
    let xpsBonus: number;
    beforeEach(async () => {
      xpsBonus = faker.number.int({ min: 0, max: 400 });
      history = historyFixture(game.id, user.id);
      saveHistoryResult = {
        hasLevelUp: false,
        history,
        player: user,
        xpsBonus,
      };
      jest.spyOn(gamesService, 'getDisplayInfo').mockResolvedValue({
        mode: GameMode.RANKED,
        paragraph: game.paragraph,
        players: [user, userFixture()],
      });
      jest
        .spyOn(historiesService, 'create')
        .mockResolvedValue(saveHistoryResult);
      payload = {
        acc: faker.number.float({ min: 0, max: 100 }),
        gameId: game.id,
        leftPlayersCount: 1,
        position: 1,
        wpm: faker.number.float({ min: 1, max: 200 }),
      };
    });
    it('should remove player from game upon finishing', async () => {
      await gateway.onPlayerFinished(socket, payload);
      expect(gamesService.updateCurrentlyPlayingGame).toHaveBeenCalledTimes(1);
      expect(gamesService.updateCurrentlyPlayingGame).toHaveBeenLastCalledWith(
        user.id,
        null,
      );
    });

    it('should send a game summary back to each player in a game', async () => {
      await gateway.onPlayerFinished(socket, payload);
      expect(socket.emit).toHaveBeenCalledWith('gameSummary', {
        wpm: payload.wpm,
        acc: payload.acc,
        position: payload.position,
        catPoints: history.catPoints,
        totalXPsBonus: xpsBonus,
        newXPsGained: user.xpsGained,
      });
    });

    it('should end game early if all players in-game have finished', async () => {
      jest
        .spyOn(gamesService, 'updateTime')
        .mockResolvedValue({ ...game, mode: GameMode.RANKED });
      jest.spyOn(historiesService, 'countPlayersFinished').mockResolvedValue(1);
      await gateway.onPlayerFinished(socket, payload);
      expect(gamesService.updateTime).toHaveBeenCalledWith(game.id, 'endedAt');
      expect(
        gateway.io.sockets.to(`game:${game.id}`).emit,
      ).toHaveBeenLastCalledWith('endGame', {
        endedAt: game.endedAt.toISOString(),
      });
    });

    it("should broadcast the current player's position to all players in a game", async () => {
      await gateway.onPlayerFinished(socket, payload);
      expect(
        gateway.io.sockets.to(`game:${game.id}`).emit,
      ).toHaveBeenCalledWith('updatePosition', {
        id: user.id,
        position: payload.position,
      });
    });

    it('should send a rank update message back to a player', async () => {
      jest.spyOn(historiesService, 'create').mockResolvedValue({
        ...saveHistoryResult,
        history: { ...history, catPoints: 500 },
      });
      await gateway.onPlayerFinished(socket, payload);
      expect(socket.emit).toHaveBeenCalledWith('rankUpdate', {
        status: RankUpdateStatus.PROMOTED,
        currentRank: getCurrentRank(user.catPoints + 500),
      });
    });

    it('should send a level up message back to a player', async () => {
      jest.spyOn(historiesService, 'create').mockResolvedValue({
        ...saveHistoryResult,
        hasLevelUp: true,
      });
      await gateway.onPlayerFinished(socket, payload);
      expect(socket.emit).toHaveBeenCalledWith('levelUp', {
        xpsGained: user.xpsGained,
        xpsRequired: determineXPsRequired(user.currentLevel),
        currentLevel: user.currentLevel,
      });
    });

    it('should broadcast a leaderboard update', async () => {
      await gateway.onPlayerFinished(socket, payload);
      expect(gateway.io.sockets.emit).toHaveBeenLastCalledWith(
        'leaderboardUpdate',
      );
    });
  });

  describe('handleDisconnect', () => {
    it('should remove player from the game, but not delete if there are players', async () => {
      const remainingPlayersCount =
        determineMaxPlayersCount(GameMode.RANKED) - 1;
      jest
        .spyOn(gamesService, 'countPlayersInGame')
        .mockResolvedValue(remainingPlayersCount);
      jest.spyOn(gamesService, 'removeIfEmpty');
      await gateway.handleDisconnect(socket);
      expect(
        gateway.io.sockets.to(`game:${game.id}`).emit,
      ).toHaveBeenCalledWith('playerLeft', {
        id: user.id,
        username: user.username,
      });
      expect(gamesService.updateCurrentlyPlayingGame).toHaveBeenCalledWith(
        user.id,
        null,
      );
      expect(gamesService.removeIfEmpty).not.toHaveBeenCalled();
      expect(gamesService.updateTime).not.toHaveBeenCalled();
    });

    it('should remove the game if no players are in-game', async () => {
      jest.spyOn(gamesService, 'updateTime').mockResolvedValue(game);
      jest.spyOn(gamesService, 'countPlayersInGame').mockResolvedValue(0);
      jest.spyOn(gamesService, 'removeIfEmpty');
      await gateway.handleDisconnect(socket);
      expect(gamesService.updateTime).toBeCalledWith(game.id, 'endedAt');
      expect(gamesService.removeIfEmpty).toHaveBeenCalledTimes(1);
      expect(gamesService.removeIfEmpty).toHaveBeenCalledWith(game.id);
      expect(
        gateway.io.sockets.to(`game:${game.id}`).emit,
      ).toHaveBeenCalledWith('endGame', {
        endedAt: game.endedAt.toISOString(),
      });
    });
  });
});
