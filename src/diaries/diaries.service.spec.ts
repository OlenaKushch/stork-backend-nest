import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { DiariesService } from './diaries.service';

describe('DiariesService', () => {
  let service: DiariesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DiariesService,
        {
          provide: PrismaService,
          useValue: {
            $transaction: jest.fn(),
            diaryEntry: {
              create: jest.fn(),
              findMany: jest.fn(),
              findFirst: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
            },
            diaryEntryEmotion: {
              deleteMany: jest.fn(),
              createMany: jest.fn(),
            },
            emotion: {
              count: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<DiariesService>(DiariesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
