import { Controller, Get } from '@nestjs/common';
import { EmotionsService } from './emotions.service';

@Controller('emotions')
export class EmotionsController {
  constructor(private readonly emotionsService: EmotionsService) {}

  @Get()
  findAll() {
    return this.emotionsService.findAll();
  }

  @Get('emotions')
  findAllLegacy() {
    return this.emotionsService.findAll();
  }
}
