import { Test, TestingModule } from '@nestjs/testing';
import { historyFixture } from '../histories/test-utils';
import { Game, GameHistory, User } from '@prisma/client';
import { v4 } from 'uuid';
import { gameFixture } from '../games/test-utils';
import { userFixture } from '../users/test-utils';
import { LeaderboardsGateway } from './leaderboards.gateway';
import { LeaderboardsService } from './leaderboards.service';
import { Server } from 'socket.io';

describe('HistoriesController', () => {
  let gateway: LeaderboardsGateway;
  let service: LeaderboardsService;
  let history: GameHistory;
  let player: User;
  let game: Game;
  let io: Server;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LeaderboardsGateway,
        {
          provide: LeaderboardsService,
          useValue: { findTop100Players: jest.fn() },
        },
      ],
    }).compile();

    gateway = module.get<LeaderboardsGateway>(LeaderboardsGateway);
    service = module.get<LeaderboardsService>(LeaderboardsService);
    game = gameFixture();
    player = userFixture();
    history = historyFixture(game.id, v4());

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

  describe('getLeaderboards', () => {
    it('should call the service and broadcast the latest leaderboards', async () => {
      type TopPlayers = Awaited<
        ReturnType<typeof service.findTop100Players>
      >['topPlayers'];
      const offset = 20;
      const payload = {
        topPlayers: [player] as unknown as TopPlayers,
        topPlayersCount: 50,
      };
      jest.spyOn(service, 'findTop100Players').mockResolvedValue(payload);

      await gateway.getLeaderboard(offset);
      expect(service.findTop100Players).toHaveBeenCalledWith(offset);
      expect(gateway.io.sockets.emit).toHaveBeenCalledWith(
        'leaderboardUpdated',
        payload,
      );
    });
  });
});
