import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { PlaygroundsModule } from './modules/playgrounds/playgrounds.module';
import { TiersModule } from './modules/tiers/tiers.module';
import { ItemsModule } from './modules/items/items.module';
import { VotesModule } from './modules/votes/votes.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { PrismaModule } from './prisma/prisma.module';
import { RedisModule } from './config/redis.module';
import { HealthController } from './modules/common/health.controller';

@Module({
  controllers: [HealthController],
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),
    PrismaModule,
    RedisModule,
    AuthModule,
    UsersModule,
    PlaygroundsModule,
    TiersModule,
    ItemsModule,
    VotesModule,
    AnalyticsModule,
  ],
})
export class AppModule {}
