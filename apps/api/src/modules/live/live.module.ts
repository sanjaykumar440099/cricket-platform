import { Module, forwardRef } from '@nestjs/common';
import { LiveService } from './live.service';
import { MatchGateway } from './gateways/match.gateway';
import { RedisModule } from '../cache/redis.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    RedisModule,
    forwardRef(() => LiveModule), // 👈 IMPORTANT
    AuthModule
  ],
  providers: [LiveService, MatchGateway],
  exports: [LiveService],
})
export class LiveModule {}
