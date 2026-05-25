import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { JourneyService } from './journey.service';

@Controller('journey')
@UseGuards(JwtAuthGuard)
export class JourneyController {
  constructor(private readonly journeyService: JourneyService) {}

  @Get('weeks')
  getWeeks(@CurrentUser() user: { id: number }) {
    return this.journeyService.getWeeks(user.id);
  }

  @Get(':weekNumber')
  getWeekDetails(
    @CurrentUser() user: { id: number },
    @Param('weekNumber', ParseIntPipe) weekNumber: number,
  ) {
    return this.journeyService.getWeekDetails(user.id, weekNumber);
  }

  @Get(':weekNumber/baby')
  getBabyDevelopment(
    @CurrentUser() user: { id: number },
    @Param('weekNumber', ParseIntPipe) weekNumber: number,
  ) {
    return this.journeyService.getBabyDevelopment(user.id, weekNumber);
  }

  @Get(':weekNumber/mom')
  getMomBody(
    @CurrentUser() user: { id: number },
    @Param('weekNumber', ParseIntPipe) weekNumber: number,
  ) {
    return this.journeyService.getMomBody(user.id, weekNumber);
  }
}
