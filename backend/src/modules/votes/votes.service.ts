import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { REDIS_CLIENT } from '../../config/redis.module';
import Redis from 'ioredis';

@Injectable()
export class VotesService {
  constructor(
    private prisma: PrismaService,
    @Inject('REDIS_CLIENT') private redis: Redis,
  ) {}

  async castVote(userId: string, itemId: string, tierId: string) {
    // Get the tier to find the score
    const tier = await this.prisma.tier.findUnique({ where: { id: tierId } });
    if (!tier) throw new BadRequestException('Invalid tier');

    // Check playground is not locked
    const item = await this.prisma.item.findUnique({
      where: { id: itemId },
      include: { playground: true },
    });
    if (!item) throw new BadRequestException('Item not found');
    if (item.playground.status === 'LOCKED') {
      throw new BadRequestException('Playground is locked');
    }

    // Upsert the vote
    const vote = await this.prisma.itemVote.upsert({
      where: { userId_itemId: { userId, itemId } },
      update: { tierId, score: tier.score, updatedAt: new Date() },
      create: { userId, itemId, tierId, score: tier.score },
    });

    // Recalculate aggregates for the item
    const aggregation = await this.recalculateItemAggregates(itemId);

    // Update analytics
    await this.prisma.playgroundAnalytics.upsert({
      where: { playgroundId: item.playgroundId },
      update: { totalVotes: { increment: 1 } },
      create: { playgroundId: item.playgroundId, totalVotes: 1 },
    });

    // Publish to Redis for realtime sync
    await this.redis.publish(
      `playground:${item.playgroundId}:votes`,
      JSON.stringify({
        itemId,
        tierId,
        userId,
        aggregation,
        timestamp: Date.now(),
      }),
    );

    return { vote, aggregation };
  }

  async recalculateItemAggregates(itemId: string) {
    const item = await this.prisma.item.findUnique({
      where: { id: itemId },
      include: {
        votes: true,
        playground: { include: { tiers: { orderBy: { score: 'desc' } } } },
      },
    });
    if (!item) return null;

    const votes = item.votes;
    const tiers = item.playground.tiers;

    if (votes.length === 0) {
      await this.prisma.item.update({
        where: { id: itemId },
        data: { totalVotes: 0, averageScore: 0, aggregateTier: null },
      });
      return { totalVotes: 0, averageScore: 0, aggregateTier: null };
    }

    const totalScore = votes.reduce((sum, v) => sum + v.score, 0);
    const averageScore = totalScore / votes.length;

    // Determine aggregate tier
    let aggregateTierName = tiers[tiers.length - 1]?.name ?? null;
    for (const tier of tiers) {
      if (averageScore >= tier.score - 0.5) {
        aggregateTierName = tier.name;
        break;
      }
    }

    await this.prisma.item.update({
      where: { id: itemId },
      data: {
        totalVotes: votes.length,
        averageScore: Math.round(averageScore * 100) / 100,
        aggregateTier: aggregateTierName,
      },
    });

    // Tier distribution
    const tierDistribution = tiers.map((tier) => ({
      tierId: tier.id,
      tierName: tier.name,
      tierColor: tier.color,
      count: votes.filter((v) => v.tierId === tier.id).length,
      percentage:
        votes.length > 0
          ? Math.round(
              (votes.filter((v) => v.tierId === tier.id).length / votes.length) * 100,
            )
          : 0,
    }));

    return {
      totalVotes: votes.length,
      averageScore: Math.round(averageScore * 100) / 100,
      aggregateTier: aggregateTierName,
      tierDistribution,
    };
  }

  async getPlaygroundAggregates(playgroundId: string) {
    const items = await this.prisma.item.findMany({
      where: { playgroundId },
      include: {
        votes: true,
      },
      orderBy: { averageScore: 'desc' },
    });

    const tiers = await this.prisma.tier.findMany({
      where: { playgroundId },
      orderBy: { score: 'desc' },
    });

    return items.map((item) => {
      const totalScore = item.votes.reduce((sum, v) => sum + v.score, 0);
      const averageScore = item.votes.length > 0 ? totalScore / item.votes.length : 0;

      let aggregateTierName = null;
      let aggregateTierColor = null;
      for (const tier of tiers) {
        if (averageScore >= tier.score - 0.5) {
          aggregateTierName = tier.name;
          aggregateTierColor = tier.color;
          break;
        }
      }

      return {
        id: item.id,
        name: item.name,
        imageUrl: item.imageUrl,
        totalVotes: item.votes.length,
        averageScore: Math.round(averageScore * 100) / 100,
        aggregateTier: aggregateTierName,
        aggregateTierColor,
      };
    });
  }

  async getUserVotes(userId: string, playgroundId: string) {
    return this.prisma.itemVote.findMany({
      where: {
        userId,
        item: { playgroundId },
      },
      include: { item: true, tier: true },
    });
  }

  async removeVote(userId: string, itemId: string) {
    await this.prisma.itemVote.delete({
      where: { userId_itemId: { userId, itemId } },
    });
    return this.recalculateItemAggregates(itemId);
  }
}
