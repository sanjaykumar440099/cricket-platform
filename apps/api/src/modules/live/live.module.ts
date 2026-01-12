import { Module } from '@nestjs/common';
import { MatchGateway } from './gateways/match.gateway';
import { LiveService } from './live.service';
import { WsAuthGuard } from './guards/ws-auth.guard';
import { AuthModule } from '../auth/auth.module';
@Module({
  imports: [
    AuthModule, // 👈 THIS FIXES THE ERROR
  ],
  providers: [
    MatchGateway,
    LiveService,
    WsAuthGuard,
  ],
  exports: [LiveService],
})
export class LiveModule {}
