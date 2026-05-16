import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { RegisterDto } from '../auth/dto/register.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(data: RegisterDto & { password: string }) {
    return this.prisma.user.create({ data });
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async findByUsername(username: string) {
    return this.prisma.user.findUnique({ where: { username } });
  }

  async findById(id: string) {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async updateProfile(id: string, data: { displayName?: string; avatar?: string }) {
    const user = await this.prisma.user.update({
      where: { id },
      data,
    });
    const { password, ...result } = user;
    return result;
  }

  async updateLastSeen(id: string) {
    return this.prisma.user.update({
      where: { id },
      data: { lastSeenAt: new Date() },
    });
  }

  async getStats(userId: string) {
    const [voteCount, playgroundCount] = await Promise.all([
      this.prisma.itemVote.count({ where: { userId } }),
      this.prisma.realtimeSession.findMany({
        where: { userId },
        select: { playgroundId: true },
        distinct: ['playgroundId'],
      }),
    ]);
    return { totalVotes: voteCount, playgroundsJoined: playgroundCount.length };
  }

  async getAllUsers(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        skip,
        take: limit,
        select: {
          id: true,
          email: true,
          username: true,
          displayName: true,
          avatar: true,
          role: true,
          isActive: true,
          lastSeenAt: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count(),
    ]);
    return { users, total, page, totalPages: Math.ceil(total / limit) };
  }
}
