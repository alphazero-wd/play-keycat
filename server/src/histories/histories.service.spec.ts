import { Test, TestingModule } from '@nestjs/testing';
import { HistoriesService } from './histories.service';
import { PrismaService } from '../prisma/prisma.service';

describe('HistoriesService', () => {
  let service: HistoriesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HistoriesService, PrismaService],
    }).compile();

    service = module.get<HistoriesService>(HistoriesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
