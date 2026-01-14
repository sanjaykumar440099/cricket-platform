import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
} from '@nestjs/websockets';
import { UseGuards, Inject, forwardRef } from '@nestjs/common';
import { Server, Socket } from 'socket.io';

import { WsAuthGuard } from '../guards/ws-auth.guard';
import { LiveService } from '../live.service';

@WebSocketGateway({ cors: { origin: '*' } })
@UseGuards(WsAuthGuard)
export class MatchGateway implements OnGatewayConnection {
  @WebSocketServer()
  server!: Server;

  constructor(
    @Inject(forwardRef(() => LiveService))
    private readonly liveService: LiveService,
  ) {}

  async handleConnection(client: Socket) {
    const { matchId } = client.handshake.query as {
      matchId?: string;
    };

    if (!matchId) {
      client.disconnect();
      return;
    }

    client.join(matchId);

    const cached = await this.liveService.getLiveState(matchId);
    if (cached) {
      client.emit('resume', {
        state: cached.state,
        lastEventId: cached.lastEventId,
      });
    }
  }

  emitScoreUpdate(matchId: string, payload: any) {
    this.server.to(matchId).emit('scoreUpdate', payload);
  }
}
