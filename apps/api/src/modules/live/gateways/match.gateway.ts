import { WebSocketGateway, SubscribeMessage, MessageBody } from '@nestjs/websockets';

@WebSocketGateway({ namespace: '/match' })
export class MatchGateway {
  @SubscribeMessage('msg')
  handleMessage(@MessageBody() data: any) {
    return { event: 'msg', data };
  }
}
