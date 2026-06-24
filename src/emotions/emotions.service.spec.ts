import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { EmotionsService } from './emotions.service';

describe('EmotionsService', () => {
  let service: EmotionsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmotionsService,
        {
          provide: PrismaService,
          useValue: {
            emotion: {
              findMany: jest.fn().mockResolvedValue([
                { id: 1, title: 'Апатія' },
                { id: 2, title: 'Бадьорість' },
              ]),
            },
          },
        },
      ],
    }).compile();

    service = module.get<EmotionsService>(EmotionsService);
  });

  it('maps emotions to frontend shape', async () => {
    await expect(service.findAll()).resolves.toEqual([
      { _id: '1', title: 'Апатія', isActive: true },
      { _id: '2', title: 'Бадьорість', isActive: true },
    ]);
  });
});
