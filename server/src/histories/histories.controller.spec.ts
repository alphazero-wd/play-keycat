import { Test, TestingModule } from '@nestjs/testing';
import { HistoriesController } from './histories.controller';
import { HistoriesService } from './histories.service';
import { historyFixture } from '../histories/test-utils';
import { Game, GameHistory, User } from '@prisma/client';
import { v4 } from 'uuid';
import { gameFixture } from '../games/test-utils';
import { userFixture } from '../users/test-utils';
import { NotFoundException } from '@nestjs/common';

describe('HistoriesController', () => {
  let controller: HistoriesController;
  let service: HistoriesService;
  let history: GameHistory;
  let player: User;
  let game: Game;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HistoriesController],
      providers: [
        {
          provide: HistoriesService,
          useValue: {
            findByGame: jest.fn(),
            findByPlayer: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<HistoriesController>(HistoriesController);
    service = module.get<HistoriesService>(HistoriesService);
    game = gameFixture();
    player = userFixture();
    history = historyFixture(game.id, v4());
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findByGame', () => {
    it('should find histories by game id', async () => {
      const gameHistories = {
        ...game,
        histories: [{ ...history, player }],
      };
      jest.spyOn(service, 'findByGame').mockResolvedValue(gameHistories);
      const result = await controller.findByGame(game.id);
      expect(result).toEqual(gameHistories);
      expect(service.findByGame).toHaveBeenCalledWith(game.id);
    });

    it('should throw a not found exception if game is not found', () => {
      jest
        .spyOn(service, 'findByGame')
        .mockRejectedValue(new NotFoundException());
      expect(controller.findByGame(game.id)).rejects.toThrowError(
        NotFoundException,
      );
    });
  });
  describe('findByPlayer', () => {
    it('should find histories by player username with offset', async () => {
      const results = {
        playerHistoriesCount: 120,
        playerHistories: [{ ...history, game }],
      };
      jest.spyOn(service, 'findByPlayer').mockResolvedValue(results);
      const offset = 20;

      expect(controller.findByPlayer(player.username, offset)).resolves.toEqual(
        results,
      );
      expect(service.findByPlayer).toHaveBeenCalledWith(
        player.username,
        offset,
      );
    });
  });
});
