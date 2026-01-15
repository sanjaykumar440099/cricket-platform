import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { UseGuards, Inject, forwardRef } from '@nestjs/common';
import { Server, Socket } from 'socket.io';

import { WsAuthGuard } from '../guards/ws-auth.guard';
import { LiveService } from '../live.service';

import {
  bindSocketToMatch,
  incrementSpectators,
  decrementSpectators,
  getMatchState,
} from '../../cache/match.cache';

@WebSocketGateway({ cors: { origin: '*' } })
@UseGuards(WsAuthGuard)
export class MatchGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server!: Server;

  constructor(
    @Inject(forwardRef(() => LiveService))
    private readonly liveService: LiveService,
  ) {}

  async handleConnection(client: Socket) {
    const { matchId, lastEventId } = client.handshake.query as {
      matchId?: string;
      lastEventId?: string;
    };

    if (!matchId) {
      client.disconnect();
      return;
    }

    /* -----------------------------
       1. Redis bindings (ONCE)
    ------------------------------ */
    await bindSocketToMatch(client.id, matchId);
    await incrementSpectators(matchId);

    /* -----------------------------
       2. Join canonical room
    ------------------------------ */
    client.join(`match:${matchId}`);

    /* -----------------------------
       3. Event-based resume (PRIMARY)
    ------------------------------ */
    const cached = await this.liveService.getLiveState(matchId);
    if (!cached) return;

    const clientLastEvent = lastEventId ? Number(lastEventId) : null;

    // CASE 1: Fresh client → full state
    if (!clientLastEvent) {
      client.emit('resume', {
        state: cached.state,
        lastEventId: cached.lastEventId,
      });
      return;
    }

    // CASE 2: No gap → do nothing
    if (clientLastEvent === cached.lastEventId) {
      return;
    }

    // CASE 3: Try replay
    const events = (await this.liveService.getLiveEvents(matchId)) || [];
    const missed = events.filter(e => e.eventId > clientLastEvent);

    if (
      missed.length === 0 ||
      missed[0].eventId !== clientLastEvent + 1
    ) {
      /* -----------------------------
         4. FALLBACK → Redis snapshot
      ------------------------------ */
      const snapshot = await getMatchState(matchId);
      if (snapshot) {
        client.emit('resume', {
          state: snapshot,
          lastEventId: cached.lastEventId,
        });
      }
      return;
    }

    // Replay missed events
    for (const event of missed) {
      client.emit('scoreUpdate', event);
    }
  }

  async handleDisconnect(client: Socket) {
    const matchId = client.handshake.query.matchId as string;
    if (matchId) {
      await decrementSpectators(matchId);
    }
  }

  emitScoreUpdate(matchId: string, payload: any) {
    this.server.to(`match:${matchId}`).emit('scoreUpdate', payload);
  }
}
