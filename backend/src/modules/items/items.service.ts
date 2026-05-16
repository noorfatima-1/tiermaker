import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateItemDto } from './dto/create-item.dto';

@Injectable()
export class ItemsService {
  constructor(private prisma: PrismaService) {}

  async create(playgroundId: string, dto: CreateItemDto) {
    const count = await this.prisma.item.count({ where: { playgroundId } });
    return this.prisma.item.create({
      data: { ...dto, playgroundId, orderIndex: dto.orderIndex ?? count },
    });
  }

  async createMany(playgroundId: string, items: CreateItemDto[]) {
    return this.prisma.$transaction(
      items.map((item, index) =>
        this.prisma.item.create({
          data: {
            ...item,
            playgroundId,
            orderIndex: item.orderIndex ?? index,
          },
        }),
      ),
    );
  }

  async findByPlayground(playgroundId: string) {
    return this.prisma.item.findMany({
      where: { playgroundId },
      include: { _count: { select: { votes: true } } },
      orderBy: { orderIndex: 'asc' },
    });
  }

  async findById(id: string) {
    const item = await this.prisma.item.findUnique({
      where: { id },
      include: {
        votes: {
          include: { tier: true },
        },
      },
    });
    if (!item) throw new NotFoundException('Item not found');
    return item;
  }

  async update(id: string, data: Partial<CreateItemDto>) {
    return this.prisma.item.update({ where: { id }, data });
  }

  async delete(id: string) {
    await this.prisma.item.delete({ where: { id } });
    return { message: 'Item deleted' };
  }

  async getItemWithAggregation(itemId: string) {
    const item = await this.prisma.item.findUnique({
      where: { id: itemId },
      include: {
        votes: { include: { tier: true } },
        playground: { include: { tiers: { orderBy: { score: 'desc' } } } },
      },
    });
    if (!item) throw new NotFoundException();

    const tiers = item.playground.tiers;
    const votes = item.votes;

    if (votes.length === 0) {
      return { ...item, aggregateResult: null };
    }

    const totalScore = votes.reduce((sum, v) => sum + v.score, 0);
    const averageScore = totalScore / votes.length;

    // Determine aggregate tier based on average score
    let aggregateTier = tiers[tiers.length - 1]; // lowest tier default
    for (const tier of tiers) {
      if (averageScore >= tier.score - 0.5) {
        aggregateTier = tier;
        break;
      }
    }

    return {
      ...item,
      aggregateResult: {
        totalVotes: votes.length,
        averageScore: Math.round(averageScore * 100) / 100,
        aggregateTierName: aggregateTier.name,
        aggregateTierColor: aggregateTier.color,
      },
    };
  }
}
