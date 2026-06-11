import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { CacheKeys } from '../../cache/cache.keys';
import { CacheService } from '../../cache/cache.service';
import { LiveEvent } from '../types/live-event.type';

@WebSocketGateway({ cors: { origin: '*' } })
export class MatchGateway
  implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  constructor(private readonly cache: CacheService) {}

  async handleConnection(client: Socket) {
    const { matchId, lastEventId } = client.handshake.query as {
      matchId?: string;
      lastEventId?: string;
    };

    if (!matchId) {
      client.emit('connectionReady', {
        message: 'Connect with matchId query or emit joinMatch.',
      });
      return;
    }

    await this.joinMatchRoom(client, matchId, lastEventId);
  }

  async handleDisconnect(client: Socket) {
    const matchId = client.data?.matchId as string | undefined;
    if (!matchId) return;

    await this.cache.removeFromSet(
      CacheKeys.matchSpectators(matchId),
      client.id,
    );
    await this.emitSpectatorCount(matchId);
  }

  emitScoreUpdate(matchId: string, payload: any) {
    this.server.to(this.room(matchId)).emit('scoreUpdate', payload);
    this.server.to(this.room(matchId)).emit('score.updated', payload);
  }

  @SubscribeMessage('joinMatch')
  async joinMatch(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: string | {
      matchId?: string;
      lastEventId?: number | string | null;
    },
  ) {
    const matchId =
      typeof payload === 'string' ? payload : payload?.matchId;
    const lastEventId =
      typeof payload === 'string' ? undefined : payload?.lastEventId;

    if (!matchId) {
      client.emit('joinMatchError', {
        message: 'matchId is required to join a live match.',
      });
      return;
    }

    await this.joinMatchRoom(
      client,
      matchId,
      lastEventId === null || lastEventId === undefined
        ? undefined
        : `${lastEventId}`,
    );
  }

  private async joinMatchRoom(
    client: Socket,
    matchId: string,
    lastEventId?: string,
  ) {
    const previousMatchId = client.data?.matchId as string | undefined;

    if (previousMatchId && previousMatchId !== matchId) {
      client.leave(this.room(previousMatchId));
      await this.cache.removeFromSet(
        CacheKeys.matchSpectators(previousMatchId),
        client.id,
      );
      await this.emitSpectatorCount(previousMatchId);
    }

    client.data.matchId = matchId;
    client.join(this.room(matchId));

    await this.cache.addToSet(
      CacheKeys.matchSpectators(matchId),
      client.id,
    );
    await this.emitSpectatorCount(matchId);
    await this.resumeClient(client, matchId, lastEventId);
  }

  private async resumeClient(
    client: Socket,
    matchId: string,
    lastEventId?: string,
  ) {
    const [resumeState, events] = await Promise.all([
      this.cache.getJSON<any>(CacheKeys.matchResume(matchId)),
      this.cache.getJSON<LiveEvent[]>(CacheKeys.liveEvents(matchId)),
    ]);

    const currentLastEventId =
      resumeState?.lastEventId ?? this.lastEventId(events);
    const clientLastEventId = lastEventId ? Number(lastEventId) : null;

    if (!clientLastEventId || !currentLastEventId) {
      if (resumeState) {
        this.emitResume(client, resumeState, currentLastEventId);
      }
      return;
    }

    if (clientLastEventId === currentLastEventId) {
      return;
    }

    const missed = (events ?? []).filter(
      event => event.eventId > clientLastEventId,
    );
    const canReplay =
      missed.length > 0 &&
      missed[0].eventId === clientLastEventId + 1;

    if (!canReplay) {
      if (resumeState) {
        this.emitResume(client, resumeState, currentLastEventId);
      }
      return;
    }

    for (const event of missed) {
      client.emit('scoreUpdate', event);
    }
  }

  private emitResume(
    client: Socket,
    state: any,
    lastEventId?: number,
  ) {
    client.emit('resumeState', state);
    client.emit('resume', {
      state,
      lastEventId: lastEventId ?? state?.lastEventId ?? null,
    });
  }

  private async emitSpectatorCount(matchId: string) {
    const count = await this.cache.countSet(
      CacheKeys.matchSpectators(matchId),
    );

    this.server.to(this.room(matchId)).emit('spectatorCount', count);
  }

  private lastEventId(events: LiveEvent[] | null) {
    if (!events?.length) {
      return null;
    }

    return events[events.length - 1].eventId;
  }

  private room(matchId: string) {
    return `match:${matchId}`;
  }
}
