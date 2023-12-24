import { Test, TestingModule } from '@nestjs/testing';
import { GamesController } from './games.controller';
import { GamesService } from './games.service';
import { historyFixture } from '../histories/test-utils';
import { Game, GameHistory, Prisma, User } from '@prisma/client';
import { v4 } from 'uuid';
import { gameFixture } from '../games/test-utils';
import { userFixture } from '../users/test-utils';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaError } from '../prisma/prisma-error';

describe('HistoriesController', () => {
  let controller: GamesController;
  let service: GamesService;
  let player: User;
  let game: Game;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GamesController],
      providers: [
        {
          provide: GamesService,
          useValue: {
            checkPlayerAlreadyInGame: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            updateCurrentlyPlayingGame: jest.fn(),
            findById: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<GamesController>(GamesController);
    service = module.get<GamesService>(GamesService);
    game = gameFixture();
    player = userFixture();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findOrCreate', () => {
    describe('when finding or creating a game', () => {
      it('should not find or create if they are already in a game', async () => {
        jest
          .spyOn(service, 'checkPlayerAlreadyInGame')
          .mockRejectedValue(new ForbiddenException());
        expect(
          controller.findOrCreate(player, { gameMode: game.mode }),
        ).rejects.toThrowError(ForbiddenException);
        expect(service.findOne).not.toHaveBeenCalled();
        expect(service.create).not.toHaveBeenCalled();
      });

      it('should not create if an available game is found', async () => {
        jest.spyOn(service, 'findOne').mockResolvedValue(game.id);
        const gameId = await controller.findOrCreate(player, {
          gameMode: game.mode,
        });
        expect(gameId).toBe(game.id);
        expect(service.findOne).toHaveBeenCalledTimes(1);
        expect(service.create).not.toHaveBeenCalled();
      });

      it('should create a game if no available game is found', async () => {
        const createdGameId = v4();
        jest.spyOn(service, 'findOne').mockResolvedValue(undefined);
        jest.spyOn(service, 'create').mockResolvedValue(createdGameId);
        const gameId = await controller.findOrCreate(player, {
          gameMode: game.mode,
        });
        expect(gameId).toBe(createdGameId);
        expect(service.findOne).toHaveBeenCalledTimes(1);
        expect(service.create).toHaveBeenCalledTimes(1);
      });
    });

    describe('when adding player to game', () => {
      it('should add the player to game', async () => {
        jest.spyOn(service, 'findOne').mockResolvedValue(game.id);
        jest.spyOn(service, 'updateCurrentlyPlayingGame');
        await controller.findOrCreate(player, { gameMode: game.mode });
        expect(service.updateCurrentlyPlayingGame).toHaveBeenCalledWith(
          player.id,
          game.id,
        );
      });
      it("should throw a not found exception if user doesn't exist", async () => {
        jest.spyOn(service, 'findOne').mockResolvedValue(game.id);
        jest.spyOn(service, 'updateCurrentlyPlayingGame').mockRejectedValue(
          new Prisma.PrismaClientKnownRequestError('', {
            clientVersion: '5.0',
            code: PrismaError.RecordNotFound,
          }),
        );
        expect(
          controller.findOrCreate(player, { gameMode: game.mode }),
        ).rejects.toThrowError(NotFoundException);
      });

      it("should throw a not found exception if game doesn't exist", async () => {
        jest.spyOn(service, 'findOne').mockResolvedValue(game.id);
        jest.spyOn(service, 'updateCurrentlyPlayingGame').mockRejectedValue(
          new Prisma.PrismaClientKnownRequestError('', {
            clientVersion: '5.0',
            code: PrismaError.ForeignViolation,
          }),
        );
        expect(
          controller.findOrCreate(player, { gameMode: game.mode }),
        ).rejects.toThrowError(NotFoundException);
      });
    });
  });

  describe('findById', () => {
    it("should throw an error if game isn't found", () => {
      jest
        .spyOn(service, 'findById')
        .mockRejectedValueOnce(new NotFoundException());
      expect(controller.findById(game.id, player)).rejects.toThrowError(
        NotFoundException,
      );
    });

    it('should return game if it is found', () => {
      jest.spyOn(service, 'findById').mockResolvedValue(game);
      expect(controller.findById(game.id, player)).resolves.toEqual(game);
    });
  });
});
