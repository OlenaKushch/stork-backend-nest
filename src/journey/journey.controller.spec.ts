import { Test, TestingModule } from '@nestjs/testing';
import { JourneyController } from './journey.controller';
import { JourneyService } from './journey.service';

describe('JourneyController', () => {
  let controller: JourneyController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [JourneyController],
      providers: [
        {
          provide: JourneyService,
          useValue: {
            getWeeks: jest.fn(),
            getWeekDetails: jest.fn(),
            getBabyDevelopment: jest.fn(),
            getMomBody: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<JourneyController>(JourneyController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
