import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { WeekQueryDto } from './dto/week-query.dto';
import { WeeksService } from './weeks.service';

@Controller('weeks')
export class WeeksController {
  constructor(private readonly weeksService: WeeksService) {}

  @Get()
  getPublicDashboard(@Query() query: WeekQueryDto) {
    return this.weeksService.getPublicDashboard(query);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  getPrivateDashboard(
    @CurrentUser() user: { id: number },
    @Query() query: WeekQueryDto,
  ) {
    return this.weeksService.getPrivateDashboard(user.id, query);
  }

  @Get(':weekNumber/baby')
  @UseGuards(JwtAuthGuard)
  getBabyDevelopment(@Param('weekNumber', ParseIntPipe) weekNumber: number) {
    return this.weeksService.getBabyDevelopment(weekNumber);
  }

  @Get(':weekNumber/mom')
  @UseGuards(JwtAuthGuard)
  getMomBody(@Param('weekNumber', ParseIntPipe) weekNumber: number) {
    return this.weeksService.getMomBody(weekNumber);
  }
}
