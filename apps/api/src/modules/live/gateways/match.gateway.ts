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
  ) { }

  async handleConnection(client: Socket) {
    const { matchId, lastEventId } = client.handshake.query as {
      matchId?: string;
      lastEventId?: string;
    };

    if (!matchId) {
      client.disconnect();
      return;
    }

    client.join(matchId);

    const cached = await this.liveService.getLiveState(matchId);

    if (!cached) return;

    const clientLastEvent = lastEventId ? Number(lastEventId) : null;

    // 🟢 CASE 1: Fresh client → full state
    if (!clientLastEvent) {
      client.emit('resume', {
        state: cached.state,
        lastEventId: cached.lastEventId,
      });
      return;
    }

    // 🟢 CASE 2: No gap
    if (clientLastEvent === cached.lastEventId) {
      return;
    }

    // 🟡 CASE 3: GAP DETECTED → TRY REPLAY 
    const events = (await this.liveService.getLiveEvents(matchId)) || [];

    const missed = events.filter(e => e.eventId > clientLastEvent);

    // 🔴 Replay not possible → send full state
    if (
      missed.length === 0 ||
      missed[0].eventId !== clientLastEvent + 1
    ) {
      client.emit('resume', {
        state: cached.state,
        lastEventId: cached.lastEventId, 
      });
      return;
    }

    // 🟢 Replay missed events
    for (const event of missed) {
      client.emit('scoreUpdate', event);
    }
  }


  emitScoreUpdate(matchId: string, payload: any) {
    this.server.to(matchId).emit('scoreUpdate', payload);
  }
}
