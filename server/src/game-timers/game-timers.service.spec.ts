import { Test, TestingModule } from '@nestjs/testing';
import { GameTimersService } from './game-timers.service';
import { Server } from 'socket.io';
import { v4 } from 'uuid';

jest.useFakeTimers();
jest.spyOn(global, 'setInterval');

describe('GameTimersService', () => {
  let service: GameTimersService;
  let io: Server;
  let gameId: string;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GameTimersService],
    }).compile();

    io = {
      sockets: {
        to: jest.fn().mockReturnValue({
          emit: jest.fn(),
        }),
      },
    } as unknown as Server;
    gameId = v4();

    service = module.get<GameTimersService>(GameTimersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('startCountdown', () => {
    it('should emit countdown every second', () => {
      const countdown = 10;
      const object = {
        callback: () => {},
      };
      jest.spyOn(object, 'callback');
      service.startCountdown(io, gameId, countdown, object.callback);
      jest.advanceTimersByTime(Math.floor(countdown / 2) * 1000);
      expect(object.callback).not.toBeCalled();
      expect(io.sockets.to(`game:${gameId}`).emit).toHaveBeenCalledTimes(
        Math.floor(countdown / 2)
      );
      expect(io.sockets.to(`game:${gameId}`).emit).toHaveBeenLastCalledWith(
        'countdown',
        Math.floor(countdown / 2) + 1,
      );
    });

    it('should invoke the callback once the timer is up', () => {
      const countdown = 10;
      const object = {
        callback: () => {},
      };
      jest.spyOn(object, 'callback');
      service.startCountdown(io, gameId, countdown, object.callback);
      jest.advanceTimersByTime((countdown + 1) * 1000);
      expect(object.callback).toBeCalledTimes(1);
      expect(io.sockets.to(`game:${gameId}`).emit).toHaveBeenLastCalledWith(
        'countdown',
        0,
      );
    });
  });
});
