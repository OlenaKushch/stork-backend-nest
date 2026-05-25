import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { WeeksService } from './weeks.service';

describe('WeeksService', () => {
  let service: WeeksService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WeeksService,
        {
          provide: PrismaService,
          useValue: {
            profile: {
              findUnique: jest.fn(),
            },
            babyState: {
              findUnique: jest.fn(),
            },
            momState: {
              findUnique: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<WeeksService>(WeeksService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
