import { Test, TestingModule } from '@nestjs/testing';
import { GamesGateway } from './games.gateway';
import { GamesService } from './games.service';
import { GameTimersService } from '../game-timers/game-timers.service';
import { HistoriesService } from '../histories/histories.service';
import { Game, GameMode, User } from '@prisma/client';
import { userFixture } from '../users/test-utils';
import { gameFixture } from './test-utils';
import { Server } from 'socket.io';
import { SocketUser } from '../common/types';
import {
  calculateAverageCPs,
  calculateTimeLimit,
  determineCountdown,
} from './utils';

jest.useFakeTimers();
jest.spyOn(global, 'setInterval');

describe('GamesGateway', () => {
  let gateway: GamesGateway;
  let gamesService: GamesService;
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
            getDisplayInfo: jest.fn(),
            updateTime: jest.fn(),
          },
        },
        { provide: HistoriesService, useValue: {} },
      ],
    }).compile();

    gateway = module.get<GamesGateway>(GamesGateway);
    gamesService = module.get<GamesService>(GamesService);
    user = userFixture();
    game = gameFixture();
    socket = {
      join: jest.fn(),
      emit: jest.fn(),
    } as unknown as SocketUser;
    io = {
      sockets: {
        to: jest.fn().mockReturnValue({
          emit: jest.fn(),
        }),
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
      jest.clearAllTimers();
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
});
