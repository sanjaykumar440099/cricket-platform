import { Injectable } from '@nestjs/common';
import { CacheService } from '../cache/cache.service';
import { MatchGateway } from './gateways/match.gateway';
import { CacheKeys } from '../cache/cache.keys';
import { LiveResumePayload } from './types/live-resume.type';
import { LiveEvent } from './types/live-event.type';

@Injectable()
export class LiveService {
  constructor(
    private readonly cache: CacheService,
    private readonly gateway: MatchGateway,
  ) {}

  emitScoreUpdate(matchId: string, payload: any) {
    this.gateway.emitScoreUpdate(matchId, payload);
  }

  async getLiveState<T = any>(
    matchId: string,
  ): Promise<LiveResumePayload<T> | null> {
    return this.cache.getJSON(
      CacheKeys.liveScore(matchId),
    );
  }

  async saveLiveState<T = any>(
    matchId: string,
    payload: Omit<LiveResumePayload<T>, 'updatedAt'>,
  ) {
    await this.cache.setJSON(
      CacheKeys.liveScore(matchId),
      {
        ...payload,
        updatedAt: Date.now(),
      },
    );
  }

  async getLiveEvents(
    matchId: string,
  ): Promise<LiveEvent[] | null> {
    return this.cache.getJSON(
      CacheKeys.liveEvents(matchId),
    );
  }
}
