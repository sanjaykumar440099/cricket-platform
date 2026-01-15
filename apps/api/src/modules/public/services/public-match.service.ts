import { Injectable, NotFoundException } from '@nestjs/common';
import { redis } from '../../cache/redis.client';
import { CacheKeys } from '../../cache/cache.keys';

@Injectable()
export class PublicMatchService {
  async getLiveMatch(matchId: string) {
    const [state, score] = await Promise.all([
      redis.get(CacheKeys.matchSnapshot(matchId)),
      redis.hgetall(CacheKeys.matchScore(matchId)),
    ]);

    if (!state) {
      throw new NotFoundException('Match not live');
    }

    return {
      state: JSON.parse(state),
      score: {
        runs: Number(score.runs || 0),
        wickets: Number(score.wickets || 0),
        overs: score.overs || '0.0',
      },
    };
  }

  async getSpectatorCount(matchId: string) {
    const count = await redis.get(CacheKeys.matchSpectators(matchId));
    return { spectators: Number(count || 0) };
  }

  async getLiveMatches() {
    const matchIds = await redis.smembers(CacheKeys.liveMatches());

    return {
      total: matchIds.length,
      matches: matchIds,
    };
  }
}
