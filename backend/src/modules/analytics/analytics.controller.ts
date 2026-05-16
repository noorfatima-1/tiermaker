import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Role } from '@prisma/client';
import { AnalyticsService } from './analytics.service';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';

@Controller('analytics')
export class AnalyticsController {
  constructor(private analyticsService: AnalyticsService) {}

  @Get('dashboard')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.ADMIN)
  async getDashboardStats() {
    return this.analyticsService.getDashboardStats();
  }

  @Get('playground/:playgroundId')
  @UseGuards(AuthGuard('jwt'))
  async getPlaygroundAnalytics(@Param('playgroundId') playgroundId: string) {
    return this.analyticsService.getPlaygroundAnalytics(playgroundId);
  }

  @Get('activity')
  async getActivityFeed(@Query('page') page = 1, @Query('limit') limit = 20) {
    return this.analyticsService.getActivityFeed(page, limit);
  }
}
