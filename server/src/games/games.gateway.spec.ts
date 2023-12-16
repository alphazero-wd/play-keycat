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

describe('GamesGateway', () => {
  let gateway: GamesGateway;
  let gamesService: GamesService;
  let gameTimersService: GameTimersService;
  let user: User;
  let game: Game;
  let socket: SocketUser;
  let io: Server;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GamesGateway,
        {
          provide: GameTimersService,
          useValue: {
            startCountdown: jest.fn(),
          },
        },
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
    gameTimersService = module.get<GameTimersService>(GameTimersService);
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
    it('should not start the countdown if there are not enough players', async () => {
      jest.spyOn(gamesService, 'getDisplayInfo').mockResolvedValueOnce({
        players: [user],
        paragraph: game.paragraph,
        mode: GameMode.RANKED,
      });
      expect(gamesService.updateTime).not.toHaveBeenCalled();
      expect(gameTimersService.startCountdown).not.toHaveBeenCalled();
    });

    it('should start a 10-second countdown if there are enough players', async () => {
      jest.spyOn(gamesService, 'getDisplayInfo').mockResolvedValueOnce({
        players: [user, { ...user, id: 2 }],
        paragraph: game.paragraph,
        mode: GameMode.RANKED,
      });
      await gateway.joinGame(socket, game.id);
      expect(gamesService.updateTime).toHaveBeenCalledTimes(1);
      expect(gamesService.updateTime).toHaveBeenCalledWith(
        game.id,
        'startedAt',
        10,
      );
      expect(gameTimersService.startCountdown).toHaveBeenCalledTimes(1);
      expect(gameTimersService.startCountdown).toHaveBeenCalledWith(
        gateway.io,
        game.id,
        10,
        expect.any(Function),
      );
    });
  });
});
