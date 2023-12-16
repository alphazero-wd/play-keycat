import { Test, TestingModule } from '@nestjs/testing';
import { LeaderboardsService } from './leaderboards.service';
import { PrismaService } from '../prisma/prisma.service';

describe('LeaderboardsService', () => {
  let service: LeaderboardsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LeaderboardsService, PrismaService],
    }).compile();

    service = module.get<LeaderboardsService>(LeaderboardsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
