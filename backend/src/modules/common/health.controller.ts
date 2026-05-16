import { Controller, Get } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Controller()
export class HealthController {
  constructor(private prisma: PrismaService) {}

  @Get()
  root() {
    return { status: 'ok', service: 'tiermaker-api', timestamp: new Date().toISOString() };
  }

  @Get('health')
  async health() {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return { status: 'healthy', database: 'connected', timestamp: new Date().toISOString() };
    } catch {
      return { status: 'unhealthy', database: 'disconnected', timestamp: new Date().toISOString() };
    }
  }
}
