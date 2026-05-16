import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  async getDashboardStats() {
    const [totalUsers, totalPlaygrounds, totalVotes, activePlaygrounds] =
      await Promise.all([
        this.prisma.user.count(),
        this.prisma.playground.count(),
        this.prisma.itemVote.count(),
        this.prisma.playground.count({ where: { status: 'ACTIVE' } }),
      ]);

    const recentActivity = await this.prisma.activity.findMany({
      take: 20,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { displayName: true, avatar: true } },
        playground: { select: { title: true, slug: true } },
      },
    });

    const topPlaygrounds = await this.prisma.playground.findMany({
      take: 5,
      where: { visibility: 'PUBLIC' },
      include: { analytics: true },
      orderBy: { analytics: { totalVotes: 'desc' } },
    });

    return {
      totalUsers,
      totalPlaygrounds,
      totalVotes,
      activePlaygrounds,
      recentActivity,
      topPlaygrounds,
    };
  }

  async getPlaygroundAnalytics(playgroundId: string) {
    const [analytics, votesByDay, topItems] = await Promise.all([
      this.prisma.playgroundAnalytics.findUnique({ where: { playgroundId } }),
      this.prisma.itemVote.groupBy({
        by: ['createdAt'],
        where: { item: { playgroundId } },
        _count: true,
        orderBy: { createdAt: 'asc' },
      }),
      this.prisma.item.findMany({
        where: { playgroundId },
        orderBy: { averageScore: 'desc' },
        take: 10,
        select: {
          id: true,
          name: true,
          imageUrl: true,
          totalVotes: true,
          averageScore: true,
          aggregateTier: true,
        },
      }),
    ]);

    return { analytics, votesByDay, topItems };
  }

  async logActivity(
    type: string,
    message: string,
    userId?: string,
    playgroundId?: string,
    metadata?: any,
  ) {
    return this.prisma.activity.create({
      data: { type, message, userId, playgroundId, metadata },
    });
  }

  async getActivityFeed(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [activities, total] = await Promise.all([
      this.prisma.activity.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { displayName: true, avatar: true, username: true } },
          playground: { select: { title: true, slug: true } },
        },
      }),
      this.prisma.activity.count(),
    ]);
    return { activities, total, page, totalPages: Math.ceil(total / limit) };
  }
}
