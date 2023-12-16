import { Test, TestingModule } from '@nestjs/testing';
import { GameTimersService } from './game-timers.service';

describe('GameTimersService', () => {
  let service: GameTimersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GameTimersService],
    }).compile();

    service = module.get<GameTimersService>(GameTimersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
