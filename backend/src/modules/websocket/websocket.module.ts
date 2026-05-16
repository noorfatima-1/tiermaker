import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PlaygroundGateway } from './playground.gateway';
import { WebsocketService } from './websocket.service';
import { VotesModule } from '../votes/votes.module';

@Module({
  imports: [
    VotesModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
      }),
    }),
  ],
  providers: [PlaygroundGateway, WebsocketService],
  exports: [WebsocketService],
})
export class WebsocketModule {}
