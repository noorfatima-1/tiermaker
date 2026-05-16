import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  Inject,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { REDIS_CLIENT } from '../../config/redis.module';
import Redis from 'ioredis';
import { v4 as uuid } from 'uuid';
import { CreatePlaygroundDto } from './dto/create-playground.dto';
import { UpdatePlaygroundDto } from './dto/update-playground.dto';

@Injectable()
export class PlaygroundsService {
  constructor(
    private prisma: PrismaService,
    @Inject('REDIS_CLIENT') private redis: Redis,
  ) {}

  async create(dto: CreatePlaygroundDto) {
    const slug = this.generateSlug(dto.title);
    const inviteCode = uuid().split('-')[0].toUpperCase();

    const playground = await this.prisma.playground.create({
      data: {
        ...dto,
        slug,
        inviteCode,
      },
      include: { tiers: true, items: true },
    });

    // Create default analytics
    await this.prisma.playgroundAnalytics.create({
      data: { playgroundId: playground.id },
    });

    return playground;
  }

  async findAll(page = 1, limit = 12, search?: string) {
    const skip = (page - 1) * limit;
    const where: any = { visibility: 'PUBLIC', status: 'ACTIVE' };
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [playgrounds, total] = await Promise.all([
      this.prisma.playground.findMany({
        where,
        skip,
        take: limit,
        include: {
          _count: { select: { items: true, sessions: true } },
          analytics: { select: { totalVotes: true, totalViews: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.playground.count({ where }),
    ]);

    return { playgrounds, total, page, totalPages: Math.ceil(total / limit) };
  }

  async findBySlug(slug: string) {
    // Try cache first
    const cached = await this.redis.get(`playground:${slug}`);
    if (cached) return JSON.parse(cached);

    const playground = await this.prisma.playground.findUnique({
      where: { slug },
      include: {
        tiers: { orderBy: { orderIndex: 'asc' } },
        items: {
          orderBy: { orderIndex: 'asc' },
          include: { _count: { select: { votes: true } } },
        },
        analytics: true,
      },
    });
    if (!playground) throw new NotFoundException('Playground not found');

    // Cache for 30 seconds
    await this.redis.set(`playground:${slug}`, JSON.stringify(playground), 'EX', 30);

    // Increment view count
    await this.prisma.playgroundAnalytics.update({
      where: { playgroundId: playground.id },
      data: { totalViews: { increment: 1 } },
    });

    return playground;
  }

  async findById(id: string) {
    const playground = await this.prisma.playground.findUnique({
      where: { id },
      include: {
        tiers: { orderBy: { orderIndex: 'asc' } },
        items: { orderBy: { orderIndex: 'asc' } },
        analytics: true,
      },
    });
    if (!playground) throw new NotFoundException('Playground not found');
    return playground;
  }

  async update(id: string, dto: UpdatePlaygroundDto) {
    await this.findById(id);
    const playground = await this.prisma.playground.update({
      where: { id },
      data: dto,
      include: { tiers: true, items: true },
    });

    // Invalidate cache
    await this.redis.del(`playground:${playground.slug}`);
    return playground;
  }

  async delete(id: string) {
    const playground = await this.findById(id);
    await this.prisma.playground.delete({ where: { id } });
    await this.redis.del(`playground:${playground.slug}`);
    return { message: 'Playground deleted' };
  }

  async toggleLock(id: string) {
    const playground = await this.findById(id);
    const newStatus = playground.status === 'LOCKED' ? 'ACTIVE' : 'LOCKED';
    return this.update(id, { status: newStatus } as any);
  }

  async resetVotes(playgroundId: string) {
    await this.prisma.$transaction([
      this.prisma.itemVote.deleteMany({ where: { item: { playgroundId } } }),
      this.prisma.item.updateMany({
        where: { playgroundId },
        data: { totalVotes: 0, averageScore: 0, aggregateTier: null },
      }),
    ]);
    return { message: 'Votes reset successfully' };
  }

  async getTrending(limit = 6) {
    return this.prisma.playground.findMany({
      where: { visibility: 'PUBLIC', status: 'ACTIVE' },
      include: {
        _count: { select: { items: true } },
        analytics: { select: { totalVotes: true, totalViews: true } },
      },
      orderBy: { analytics: { totalVotes: 'desc' } },
      take: limit,
    });
  }

  async getAdminPlaygrounds(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [playgrounds, total] = await Promise.all([
      this.prisma.playground.findMany({
        skip,
        take: limit,
        include: {
          _count: { select: { items: true, sessions: true } },
          analytics: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.playground.count(),
    ]);
    return { playgrounds, total, page, totalPages: Math.ceil(total / limit) };
  }

  async findByInviteCode(code: string) {
    const playground = await this.prisma.playground.findUnique({
      where: { inviteCode: code },
      include: { tiers: true, items: true },
    });
    if (!playground) throw new NotFoundException('Invalid invite code');
    return playground;
  }

  private generateSlug(title: string): string {
    const base = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    const suffix = uuid().split('-')[0];
    return `${base}-${suffix}`;
  }
}
