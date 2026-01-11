import { Module } from '@nestjs/common';
import { MatchGateway } from './gateways/match.gateway';
import { LiveService } from './live.service';

@Module({
  providers: [MatchGateway, LiveService],
  exports: [LiveService],
})
export class LiveModule {}
