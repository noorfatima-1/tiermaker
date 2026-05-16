import { Injectable, Inject, Logger, OnModuleInit } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../prisma/prisma.service';
import { REDIS_CLIENT } from '../../config/redis.module';
import Redis from 'ioredis';

@Injectable()
export class QueueService implements OnModuleInit {
  private readonly logger = new Logger(QueueService.name);

  constructor(
    private prisma: PrismaService,
    @Inject('REDIS_CLIENT') private redis: Redis,
  ) {}

  async onModuleInit() {
    this.logger.log('Queue service initialized');
  }

  // Clean up stale realtime sessions every 5 minutes
  @Cron(CronExpression.EVERY_5_MINUTES)
  async cleanupStaleSessions() {
    const staleThreshold = new Date(Date.now() - 10 * 60 * 1000); // 10 minutes
    const stale = await this.prisma.realtimeSession.updateMany({
      where: {
        isActive: true,
        joinedAt: { lt: staleThreshold },
      },
      data: { isActive: false, leftAt: new Date() },
    });

    if (stale.count > 0) {
      this.logger.log(`Cleaned up ${stale.count} stale sessions`);
    }
  }

  // Recalculate all item aggregates hourly
  @Cron(CronExpression.EVERY_HOUR)
  async recalculateAggregates() {
    const items = await this.prisma.item.findMany({
      include: {
        votes: true,
        playground: { include: { tiers: { orderBy: { score: 'desc' } } } },
      },
    });

    for (const item of items) {
      const votes = item.votes;
      const tiers = item.playground.tiers;

      if (votes.length === 0) continue;

      const totalScore = votes.reduce((sum, v) => sum + v.score, 0);
      const averageScore = totalScore / votes.length;

      let aggregateTier = tiers[tiers.length - 1]?.name ?? null;
      for (const tier of tiers) {
        if (averageScore >= tier.score - 0.5) {
          aggregateTier = tier.name;
          break;
        }
      }

      await this.prisma.item.update({
        where: { id: item.id },
        data: {
          totalVotes: votes.length,
          averageScore: Math.round(averageScore * 100) / 100,
          aggregateTier,
        },
      });
    }

    this.logger.log(`Recalculated aggregates for ${items.length} items`);
  }
}
