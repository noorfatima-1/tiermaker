import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateTierDto } from './dto/create-tier.dto';

@Injectable()
export class TiersService {
  constructor(private prisma: PrismaService) {}

  async create(playgroundId: string, dto: CreateTierDto) {
    return this.prisma.tier.create({
      data: { ...dto, playgroundId },
    });
  }

  async createMany(playgroundId: string, tiers: CreateTierDto[]) {
    return this.prisma.$transaction(
      tiers.map((tier) =>
        this.prisma.tier.create({
          data: { ...tier, playgroundId },
        }),
      ),
    );
  }

  async findByPlayground(playgroundId: string) {
    return this.prisma.tier.findMany({
      where: { playgroundId },
      orderBy: { orderIndex: 'asc' },
    });
  }

  async update(id: string, data: Partial<CreateTierDto>) {
    return this.prisma.tier.update({ where: { id }, data });
  }

  async delete(id: string) {
    await this.prisma.tier.delete({ where: { id } });
    return { message: 'Tier deleted' };
  }

  async reorder(playgroundId: string, tierIds: string[]) {
    return this.prisma.$transaction(
      tierIds.map((id, index) =>
        this.prisma.tier.update({
          where: { id },
          data: { orderIndex: index },
        }),
      ),
    );
  }
}
