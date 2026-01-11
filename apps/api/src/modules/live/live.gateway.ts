import { WebSocketGateway, SubscribeMessage, MessageBody } from '@nestjs/websockets';

@WebSocketGateway()
export class LiveGateway {
  @SubscribeMessage('msg')
  handleMessage(@MessageBody() data: any) {
    return { event: 'msg', data };
  }
}
