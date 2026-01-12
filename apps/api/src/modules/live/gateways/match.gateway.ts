import { WebSocketGateway, WebSocketServer, SubscribeMessage, MessageBody, ConnectedSocket } from '@nestjs/websockets';
import { UseGuards } from '@nestjs/common';
import { Server, Socket } from 'socket.io';

import { WsAuthGuard } from '../guards/ws-auth.guard';
import { WsUser } from '../decorators/ws-user.decorator';
import { JwtPayload } from '../../auth/types/jwt-payload.interface';

@WebSocketGateway({ cors: { origin: '*' } })
@UseGuards(WsAuthGuard)
export class MatchGateway {
  @WebSocketServer()
  server!: Server;

  @SubscribeMessage('joinMatch')
  handleJoinMatch(
    @ConnectedSocket() client: Socket,   // ✅ CORRECT
    @MessageBody() matchId: string,
    @WsUser() user: JwtPayload,
  ) {
    client.join(matchId);
    return { joined: matchId };
  }

  emitScoreUpdate(matchId: string, payload: any) {
    this.server.to(matchId).emit('scoreUpdate', payload);
  }
}
