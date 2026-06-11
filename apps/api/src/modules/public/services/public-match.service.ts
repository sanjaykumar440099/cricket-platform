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

    const match = await this.matchRepo.findOne({
      where: { id: matchId },
      relations: ['teamA', 'teamB', 'winnerTeam'],
    });

    if (!match) {
      throw new NotFoundException('Match not found');
    }

    if (!payload && match.status !== 'live') {
      throw new NotFoundException('Match not live');
    }

    return {
      matchId,
      match: {
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
          },
      score: payload?.score ?? null,
      state: payload?.state ?? null,
      lastBall: payload?.lastBall ?? null,
      commentary: payload?.commentary ?? null,
      recentEvents: events ?? [],
      lastEventId: payload?.lastEventId ?? null,
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
    const [cachedMatchIds, databaseLiveMatches] = await Promise.all([
      redis.smembers(CacheKeys.liveMatches()),
      this.matchRepo.find({
        where: { status: 'live' },
        select: { id: true },
      }),
    ]);

    const matchIds = Array.from(
      new Set([
        ...cachedMatchIds,
        ...databaseLiveMatches.map(match => match.id),
      ]),
    );

    return {
      total: matchIds.length,
      matches: matchIds,
    };
  }
}
