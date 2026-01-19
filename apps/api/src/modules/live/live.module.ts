import { Module } from '@nestjs/common';
import { LiveService } from './live.service';
import { MatchGateway } from './gateways/match.gateway';
import { LiveGateway } from './live.gateway';

import { BallsModule } from '../balls/balls.module';
import { AuthModule } from '../auth/auth.module';
import { ScoringModule } from '../scoring/scoring.module';
import { CacheModule } from '../cache/cache.module';

@Module({
  imports: [
    BallsModule,
    AuthModule,     // for WsJwtGuard
    ScoringModule,  // provides ScoringService
    CacheModule,    // provides CacheService
  ],
  providers: [
    LiveService,
    MatchGateway,
    LiveGateway,    // ✅ ONLY here
  ],
  exports: [
    LiveGateway,    // optional but recommended
  ],
})
export class LiveModule {}
