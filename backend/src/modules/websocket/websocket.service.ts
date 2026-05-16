import { Injectable, Inject, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { REDIS_CLIENT, REDIS_SUBSCRIBER } from '../../config/redis.module';
import Redis from 'ioredis';

@Injectable()
export class WebsocketService {
  private readonly logger = new Logger(WebsocketService.name);

  constructor(
    private prisma: PrismaService,
    @Inject('REDIS_CLIENT') private redis: Redis,
    @Inject('REDIS_SUBSCRIBER') private redisSub: Redis,
  ) {}

  async joinPlayground(userId: string, playgroundId: string, socketId: string) {
    // Create realtime session
    await this.prisma.realtimeSession.create({
      data: { userId, playgroundId, socketId },
    });

    // Track in Redis for fast lookups
    await this.redis.sadd(`room:${playgroundId}:users`, userId);
    await this.redis.hset(`socket:${socketId}`, {
      userId,
      playgroundId,
    });

    // Update analytics peak concurrent
    const currentCount = await this.redis.scard(`room:${playgroundId}:users`);
    await this.prisma.playgroundAnalytics.upsert({
      where: { playgroundId },
      update: {
        uniqueVisitors: { increment: 1 },
        peakConcurrent: { increment: 0 }, // Will use max below
      },
      create: { playgroundId, uniqueVisitors: 1, peakConcurrent: Number(currentCount) },
    });

    // Update peak if current is higher
    const analytics = await this.prisma.playgroundAnalytics.findUnique({
      where: { playgroundId },
    });
    if (analytics && Number(currentCount) > analytics.peakConcurrent) {
      await this.prisma.playgroundAnalytics.update({
        where: { playgroundId },
        data: { peakConcurrent: Number(currentCount) },
      });
    }

    return Number(currentCount);
  }

  async leavePlayground(socketId: string) {
    const session = await this.redis.hgetall(`socket:${socketId}`);
    if (!session?.userId || !session?.playgroundId) return;

    // Remove from Redis
    await this.redis.srem(`room:${session.playgroundId}:users`, session.userId);
    await this.redis.del(`socket:${socketId}`);

    // Update DB session
    await this.prisma.realtimeSession.updateMany({
      where: { socketId, isActive: true },
      data: { isActive: false, leftAt: new Date() },
    });

    const currentCount = await this.redis.scard(`room:${session.playgroundId}:users`);
    return {
      playgroundId: session.playgroundId,
      userId: session.userId,
      participantCount: Number(currentCount),
    };
  }

  async getOnlineUsers(playgroundId: string): Promise<string[]> {
    const userIds = await this.redis.smembers(`room:${playgroundId}:users`);
    return userIds;
  }

  async getParticipantCount(playgroundId: string): Promise<number> {
    return Number(await this.redis.scard(`room:${playgroundId}:users`));
  }

  async subscribeToVotes(playgroundId: string, callback: (data: any) => void) {
    const channel = `playground:${playgroundId}:votes`;
    await this.redisSub.subscribe(channel);
    this.redisSub.on('message', (ch, message) => {
      if (ch === channel) {
        callback(JSON.parse(message));
      }
    });
  }
}
