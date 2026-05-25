import { Test, TestingModule } from '@nestjs/testing';
import { WeeksController } from './weeks.controller';
import { WeeksService } from './weeks.service';

describe('WeeksController', () => {
  let controller: WeeksController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WeeksController],
      providers: [
        {
          provide: WeeksService,
          useValue: {
            getPublicDashboard: jest.fn(),
            getPrivateDashboard: jest.fn(),
            getBabyDevelopment: jest.fn(),
            getMomBody: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<WeeksController>(WeeksController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
