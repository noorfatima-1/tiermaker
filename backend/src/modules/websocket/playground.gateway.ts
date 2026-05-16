import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Server, Socket } from 'socket.io';
import { WebsocketService } from './websocket.service';
import { VotesService } from '../votes/votes.service';
import { PrismaService } from '../../prisma/prisma.service';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  username?: string;
  playgroundId?: string;
}

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  },
  namespace: '/playground',
})
export class PlaygroundGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(PlaygroundGateway.name);

  constructor(
    private jwtService: JwtService,
    private websocketService: WebsocketService,
    private votesService: VotesService,
    private prisma: PrismaService,
  ) {}

  async handleConnection(client: AuthenticatedSocket) {
    try {
      const token =
        client.handshake.auth?.token ||
        client.handshake.headers?.authorization?.replace('Bearer ', '');

      if (!token) {
        client.disconnect();
        return;
      }

      const payload = this.jwtService.verify(token);
      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
      });
      if (!user) {
        client.disconnect();
        return;
      }

      client.userId = user.id;
      client.username = user.displayName;
      this.logger.log(`Client connected: ${user.displayName} (${client.id})`);
    } catch {
      client.disconnect();
    }
  }

  async handleDisconnect(client: AuthenticatedSocket) {
    if (!client.userId) return;

    const result = await this.websocketService.leavePlayground(client.id);
    if (result) {
      this.server.to(result.playgroundId).emit('user:left', {
        userId: result.userId,
        participantCount: result.participantCount,
      });

      this.server.to(result.playgroundId).emit('presence:update', {
        onlineUsers: await this.websocketService.getOnlineUsers(result.playgroundId),
        count: result.participantCount,
      });
    }

    this.logger.log(`Client disconnected: ${client.userId} (${client.id})`);
  }

  @SubscribeMessage('playground:join')
  async handleJoinPlayground(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { playgroundId: string },
  ) {
    const { playgroundId } = data;
    client.playgroundId = playgroundId;
    client.join(playgroundId);

    const count = await this.websocketService.joinPlayground(
      client.userId!,
      playgroundId,
      client.id,
    );

    const onlineUsers = await this.websocketService.getOnlineUsers(playgroundId);

    // Notify everyone in the room
    this.server.to(playgroundId).emit('user:joined', {
      userId: client.userId,
      username: client.username,
      participantCount: count,
    });

    this.server.to(playgroundId).emit('presence:update', {
      onlineUsers,
      count,
    });

    // Send current state to the joining user
    const userVotes = await this.votesService.getUserVotes(
      client.userId!,
      playgroundId,
    );
    const aggregates = await this.votesService.getPlaygroundAggregates(playgroundId);

    client.emit('playground:state', {
      userVotes,
      aggregates,
      onlineUsers,
      participantCount: count,
    });
  }

  @SubscribeMessage('playground:leave')
  async handleLeavePlayground(@ConnectedSocket() client: AuthenticatedSocket) {
    if (client.playgroundId) {
      client.leave(client.playgroundId);
      const result = await this.websocketService.leavePlayground(client.id);
      if (result) {
        this.server.to(result.playgroundId).emit('user:left', {
          userId: result.userId,
          participantCount: result.participantCount,
        });
      }
    }
  }

  @SubscribeMessage('vote:cast')
  async handleVote(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { itemId: string; tierId: string },
  ) {
    if (!client.userId || !client.playgroundId) return;

    try {
      const result = await this.votesService.castVote(
        client.userId,
        data.itemId,
        data.tierId,
      );

      // Broadcast to all users in the playground
      this.server.to(client.playgroundId).emit('vote:update', {
        itemId: data.itemId,
        tierId: data.tierId,
        userId: client.userId,
        username: client.username,
        aggregation: result.aggregation,
        timestamp: Date.now(),
      });

      // Send full aggregates update
      const aggregates = await this.votesService.getPlaygroundAggregates(
        client.playgroundId,
      );
      this.server.to(client.playgroundId).emit('aggregates:update', aggregates);
    } catch (error: any) {
      client.emit('vote:error', { message: error.message });
    }
  }

  @SubscribeMessage('vote:remove')
  async handleRemoveVote(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { itemId: string },
  ) {
    if (!client.userId || !client.playgroundId) return;

    try {
      const aggregation = await this.votesService.removeVote(
        client.userId,
        data.itemId,
      );

      this.server.to(client.playgroundId).emit('vote:removed', {
        itemId: data.itemId,
        userId: client.userId,
        aggregation,
      });

      const aggregates = await this.votesService.getPlaygroundAggregates(
        client.playgroundId,
      );
      this.server.to(client.playgroundId).emit('aggregates:update', aggregates);
    } catch (error: any) {
      client.emit('vote:error', { message: error.message });
    }
  }

  @SubscribeMessage('item:drag')
  async handleItemDrag(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { itemId: string; tierId: string; position: number },
  ) {
    if (!client.playgroundId) return;

    // Broadcast drag state to other users (optimistic UI)
    client.to(client.playgroundId).emit('item:dragging', {
      userId: client.userId,
      username: client.username,
      itemId: data.itemId,
      tierId: data.tierId,
      position: data.position,
    });
  }

  @SubscribeMessage('cursor:move')
  async handleCursorMove(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { x: number; y: number },
  ) {
    if (!client.playgroundId) return;

    client.to(client.playgroundId).emit('cursor:update', {
      userId: client.userId,
      username: client.username,
      x: data.x,
      y: data.y,
    });
  }

  @SubscribeMessage('playground:lock')
  async handleLock(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { locked: boolean },
  ) {
    if (!client.playgroundId) return;

    this.server.to(client.playgroundId).emit('playground:locked', {
      locked: data.locked,
    });
  }
}
