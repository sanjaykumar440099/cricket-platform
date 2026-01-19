import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UseGuards } from '@nestjs/common';
import { WsJwtGuard } from '../auth/guards/ws-jwt.guard';
import { WsRolesGuard } from '../auth/guards/ws-roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/enums/user-role.enum';
import { CacheService } from '../cache/cache.service';
import { CacheKeys } from '../cache/cache.keys';
import { BallEventDto } from '../scoring/dto/ball-event.dto';
import { ScoringService } from '../scoring/scoring.service';
@WebSocketGateway({ cors: { origin: '*' } })
@UseGuards(WsJwtGuard, WsRolesGuard)
export class LiveGateway {
  constructor(
    private readonly cache: CacheService,
    private readonly scoringService: ScoringService,
  ) { }

  @WebSocketServer()
  server!: Server;

  handleConnection(client: Socket) { }

  async handleDisconnect(client: Socket) {
    const matchId = client.data?.matchId;
    if (!matchId) return;

    await this.cache.removeFromSet(
      CacheKeys.matchSpectators(matchId),
      client.id,
    );

    const count = await this.cache.countSet(
      CacheKeys.matchSpectators(matchId),
    );

    this.server.to(`match:${matchId}`).emit('spectatorCount', count);
  }

  @SubscribeMessage('joinMatch')
  async joinMatch(
    @ConnectedSocket() client: Socket,
    @MessageBody() matchId: string,
  ) {
    client.data.matchId = matchId;
    client.join(`match:${matchId}`);

    await this.cache.addToSet(
      CacheKeys.matchSpectators(matchId),
      client.id,
    );

    const count = await this.cache.countSet(
      CacheKeys.matchSpectators(matchId),
    );

    this.server.to(`match:${matchId}`).emit('spectatorCount', count);

    const snapshot = await this.cache.getJSON(
      CacheKeys.matchResume(matchId),
    );

    if (snapshot) {
      client.emit('resumeState', snapshot);
    }
  }

  emitScore(matchId: string, score: any) {
    this.server.to(`match:${matchId}`).emit('scoreUpdate', score);
  }

  @Roles(UserRole.SCORER)
  @SubscribeMessage('scoreBall')
  async handleScoreBall(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: BallEventDto,
  ) {
    const { score } =
      await this.scoringService.addBall(payload);

    this.emitScore(payload.matchId, score);
  }
}

