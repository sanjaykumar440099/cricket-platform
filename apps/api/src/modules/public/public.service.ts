import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { PointsTableEntity } from '../tournaments/entities/points-table.entity';
import { MatchEntity } from '../matches/entities/match.entity';
import { BallEntity } from '../matches/entities/ball.entity';

import { RedisService } from '../cache/redis.service';
import { CacheKeys } from '../cache/cache.keys';

@Injectable()
export class PublicService {
  constructor(
    @InjectRepository(PointsTableEntity)
    private readonly pointsRepo: Repository<PointsTableEntity>,

    @InjectRepository(MatchEntity)
    private readonly matchRepo: Repository<MatchEntity>,

    @InjectRepository(BallEntity)
    private readonly ballRepo: Repository<BallEntity>,

    private readonly redisService: RedisService,
  ) {}

  /* =========================
     LEADERBOARD (CACHED)
     ========================= */
  async getLeaderboard(tournamentId: string) {
    const cacheKey = CacheKeys.pointsTable(tournamentId);

    const cached = await this.redisService.get(cacheKey);
    if (cached) return cached;

    const rows = await this.pointsRepo.find({
      where: { tournamentId },
      order: { points: 'DESC', netRunRate: 'DESC' },
    });

    const data = {
      tournamentId,
      table: rows.map(r => ({
        teamId: r.teamId,
        matches: r.matches,
        wins: r.wins,
        losses: r.losses,
        ties: r.ties,
        noResults: r.noResults,
        points: r.points,
        netRunRate: r.netRunRate,
      })),
    };

    await this.redisService.set(cacheKey, data, 60);
    return data;
  }

  /* =========================
     TEAM STATS (CACHED)
     ========================= */
  async getTeamStats(tournamentId: string, teamId: string) {
    const cacheKey = `team:${tournamentId}:${teamId}`;

    const cached = await this.redisService.get(cacheKey);
    if (cached) return cached;

    const row = await this.pointsRepo.findOne({
      where: { tournamentId, teamId },
    });

    if (!row) {
      throw new NotFoundException('Team not found in tournament');
    }

    const data = {
      teamId,
      matches: row.matches,
      runsFor: row.runsFor,
      runsAgainst: row.runsAgainst,
      oversFaced: row.oversFaced,
      oversBowled: row.oversBowled,
      netRunRate: row.netRunRate,
    };

    await this.redisService.set(cacheKey, data, 60);
    return data;
  }

  /* =========================
     MATCH SUMMARY (CACHED)
     ========================= */
  async getMatchSummary(matchId: string) {
    const cacheKey = CacheKeys.matchSummary(matchId);

    const cached = await this.redisService.get(cacheKey);
    if (cached) return cached;

    const match = await this.matchRepo.findOne({
      where: { id: matchId },
    });

    if (!match) {
      throw new NotFoundException('Match not found');
    }

    const data = {
      matchId: match.id,
      teamAId: match.teamAId,
      teamBId: match.teamBId,
      status: match.status,
      winnerTeamId: match.winnerTeamId,
    };

    await this.redisService.set(cacheKey, data, 30);
    return data;
  }

  /* =========================
     PLAYER STATS (CACHED)
     ========================= */
  async getPlayerStats(playerId: string) {
    const cacheKey = `player:${playerId}`;

    const cached = await this.redisService.get(cacheKey);
    if (cached) return cached;

    const balls = await this.ballRepo.find({
      where: [
        { strikerId: playerId },
        { bowlerId: playerId },
      ],
    });

    let runs = 0;
    let ballsFaced = 0;
    let wickets = 0;

    for (const b of balls) {
      if (b.strikerId === playerId) {
        runs += b.runsOffBat;
        if (b.extraType !== 'wide') {
          ballsFaced++;
        }
      }

      if (b.bowlerId === playerId && b.isWicket) {
        wickets++;
      }
    }

    const data = {
      playerId,
      runs,
      balls: ballsFaced,
      wickets,
    };

    await this.redisService.set(cacheKey, data, 30);
    return data;
  }
}
