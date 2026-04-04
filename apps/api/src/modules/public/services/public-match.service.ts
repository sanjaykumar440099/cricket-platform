import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CacheKeys } from '../../cache/cache.keys';
import { CacheService } from '../../cache/cache.service';
import { redis } from '../../cache/redis.client';
import { MatchEntity } from '../../matches/entities/match.entity';

@Injectable()
export class PublicMatchService {
  constructor(
    private readonly cache: CacheService,
    @InjectRepository(MatchEntity)
    private readonly matchRepo: Repository<MatchEntity>,
  ) {}

  async getLiveMatch(matchId: string) {
    const [resume, liveState, events] = await Promise.all([
      this.cache.getJSON<any>(CacheKeys.matchResume(matchId)),
      this.cache.getJSON<any>(CacheKeys.liveScore(matchId)),
      this.cache.getJSON<any[]>(CacheKeys.liveEvents(matchId)),
    ]);

    const payload = resume ?? liveState;

    if (!payload) {
      throw new NotFoundException('Match not live');
    }

    const match = await this.matchRepo.findOne({
      where: { id: matchId },
      relations: ['teamA', 'teamB', 'winnerTeam'],
    });

    return {
      matchId,
      match: match
        ? {
            id: match.id,
            tournamentId: match.tournamentId,
            status: match.status,
            oversLimit: match.oversLimit,
            startTime: match.startTime,
            winnerTeamId: match.winnerTeamId,
            teamA: match.teamA
              ? {
                  id: match.teamA.id,
                  name: match.teamA.name,
                  shortName: match.teamA.shortName ?? null,
                }
              : null,
            teamB: match.teamB
              ? {
                  id: match.teamB.id,
                  name: match.teamB.name,
                  shortName: match.teamB.shortName ?? null,
                }
              : null,
            winnerTeam: match.winnerTeam
              ? {
                  id: match.winnerTeam.id,
                  name: match.winnerTeam.name,
                  shortName: match.winnerTeam.shortName ?? null,
                }
              : null,
          }
        : null,
      score: payload.score ?? payload.state ?? null,
      state: payload.state ?? null,
      lastBall: payload.lastBall ?? null,
      commentary: payload.commentary ?? null,
      recentEvents: events ?? [],
      lastEventId: payload.lastEventId ?? null,
    };
  }

  async getSpectatorCount(matchId: string) {
    return {
      spectators: await this.cache.countSet(
        CacheKeys.matchSpectators(matchId),
      ),
    };
  }

  async getLiveMatches() {
    const matchIds = await redis.smembers(CacheKeys.liveMatches());

    return {
      total: matchIds.length,
      matches: matchIds,
    };
  }
}
