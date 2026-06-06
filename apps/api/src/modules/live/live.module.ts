import { Module } from '@nestjs/common';
import { CacheModule } from '../cache/cache.module';
import { MatchGateway } from './gateways/match.gateway';
import { LiveService } from './live.service';

@Module({
  imports: [CacheModule],
  providers: [LiveService, MatchGateway],
  exports: [LiveService],
})
export class LiveModule {}
