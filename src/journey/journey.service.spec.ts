import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { JourneyService } from './journey.service';

describe('JourneyService', () => {
  let service: JourneyService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JourneyService,
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
            task: {
              findMany: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<JourneyService>(JourneyService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
