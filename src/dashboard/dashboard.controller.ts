import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt-auth.guard';
import { DashboardService } from './dashboard.service';
import { DashboardQueryDto } from './dto/dashboard-query.dto';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get()
  @UseGuards(OptionalJwtAuthGuard)
  getDashboard(
    @CurrentUser() user: { id: number; email: string } | null,
    @Query() query: DashboardQueryDto,
  ) {
    return this.dashboardService.getDashboard(user, query);
  }
}
