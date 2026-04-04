import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';

import { PointsTableEntity } from '../tournaments/entities/points-table.entity';
import { TournamentEntity } from '../tournaments/entities/tournament.entity';
import { MatchEntity } from '../matches/entities/match.entity';
import { BallEntity } from '../matches/entities/ball.entity';
import { Team } from '../teams/entities/team.entity';
import { InningsEntity } from '../innings/entities/innings.entity';
import { ScoreSnapshotEntity } from '../scores/entities/score-snapshot.entity';

import { CacheService } from '../cache/cache.service';
import { CacheKeys } from '../cache/cache.keys';

@Injectable()
export class PublicService {
  constructor(
    @InjectRepository(PointsTableEntity)
    private readonly pointsRepo: Repository<PointsTableEntity>,

    @InjectRepository(TournamentEntity)
    private readonly tournamentRepo: Repository<TournamentEntity>,

    @InjectRepository(MatchEntity)
    private readonly matchRepo: Repository<MatchEntity>,

    @InjectRepository(BallEntity)
    private readonly ballRepo: Repository<BallEntity>,

    @InjectRepository(Team)
    private readonly teamRepo: Repository<Team>,

    @InjectRepository(InningsEntity)
    private readonly inningsRepo: Repository<InningsEntity>,

    @InjectRepository(ScoreSnapshotEntity)
    private readonly snapshotRepo: Repository<ScoreSnapshotEntity>,

    private readonly cache: CacheService,
  ) {}

  async getLeaderboard(tournamentId: string) {
    const cacheKey = CacheKeys.pointsTable(tournamentId);

    const cached = await this.cache.getJSON(cacheKey);
    if (cached) return cached;

    const rows = await this.pointsRepo.find({
      where: { tournamentId },
      order: { points: 'DESC', netRunRate: 'DESC' },
    });
    const tournament = await this.tournamentRepo.findOne({
      where: { id: tournamentId },
    });

    const data = {
      tournamentId,
      tournament: tournament
        ? {
            id: tournament.id,
            name: tournament.name,
            format: tournament.format,
          }
        : null,
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

    await this.cache.setJSON(cacheKey, data);
    return data;
  }

  async getTeamStats(tournamentId: string, teamId: string) {
    const cacheKey = `team:${tournamentId}:${teamId}`;

    const cached = await this.cache.getJSON(cacheKey);
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

    await this.cache.setJSON(cacheKey, data);
    return data;
  }

  async getMatchSummary(matchId: string) {
    const cacheKey = `${CacheKeys.matchSummary(matchId)}:v2`;

    const cached = await this.cache.getJSON(cacheKey);
    if (cached) return cached;

    const match = await this.matchRepo.findOne({
      where: { id: matchId },
      relations: ['teamA', 'teamB', 'winnerTeam', 'tournament'],
    });

    if (!match) {
      throw new NotFoundException('Match not found');
    }

    const innings = await this.inningsRepo.find({
      where: { matchId },
      order: {
        inningsNumber: 'ASC',
        createdAt: 'ASC',
      },
    });
    const snapshots = innings.length
      ? await this.snapshotRepo.find({
          where: {
            inningsId: In(innings.map(entry => entry.id)),
          },
        })
      : [];
    const snapshotsByInningsId = new Map(
      snapshots.map(snapshot => [snapshot.inningsId, snapshot]),
    );

    const data = {
      matchId: match.id,
      tournamentId: match.tournamentId,
      oversLimit: match.oversLimit,
      startTime: match.startTime,
      teamAId: match.teamAId,
      teamBId: match.teamBId,
      status: match.status,
      winnerTeamId: match.winnerTeamId,
      isTie: match.isTie,
      isNoResult: match.isNoResult,
      tournament: match.tournament
        ? {
            id: match.tournament.id,
            name: match.tournament.name,
            format: match.tournament.format,
          }
        : null,
      teamA: this.toTeamSummary(match.teamA),
      teamB: this.toTeamSummary(match.teamB),
      winnerTeam: this.toTeamSummary(match.winnerTeam),
      innings: innings.map(entry => ({
        id: entry.id,
        inningsNumber: entry.inningsNumber,
        battingTeamId: entry.battingTeamId,
        bowlingTeamId: entry.bowlingTeamId,
        isCompleted: entry.isCompleted,
        isSuperOver: entry.isSuperOver,
        score: this.toScoreSummary(
          snapshotsByInningsId.get(entry.id) ?? null,
        ),
      })),
    };

    await this.cache.setJSON(cacheKey, data);
    return data;
  }

  async getPlayerStats(playerId: string) {
    const cacheKey = `player:${playerId}`;

    const cached = await this.cache.getJSON(cacheKey);
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

    await this.cache.setJSON(cacheKey, data);
    return data;
  }

  async getTeamPlayers(teamId: string) {
    const cacheKey = `public:team:${teamId}:players`;

    const cached = await this.cache.getJSON(cacheKey);
    if (cached) return cached;

    const team = await this.teamRepo.findOne({
      where: { id: teamId },
      relations: ['players'],
    });

    if (!team) {
      throw new NotFoundException('Team not found');
    }

    const data = {
      teamId,
      team: this.toTeamSummary(team),
      players: [...(team.players ?? [])]
        .sort((left, right) => left.name.localeCompare(right.name))
        .map(player => ({
          id: player.id,
          name: player.name,
          role: player.role ?? null,
        })),
    };

    await this.cache.setJSON(cacheKey, data);
    return data;
  }

  private toTeamSummary(team?: Team | null) {
    if (!team) {
      return null;
    }

    return {
      id: team.id,
      name: team.name,
      shortName: team.shortName ?? null,
      logoUrl: team.logoUrl ?? null,
    };
  }

  private toScoreSummary(snapshot: ScoreSnapshotEntity | null) {
    if (!snapshot) {
      return null;
    }

    const totalBalls =
      snapshot.completedOvers * 6 + snapshot.ballsInOver;
    const oversAsNumber = totalBalls / 6;

    return {
      runs: snapshot.totalRuns,
      wickets: snapshot.wickets,
      overs: `${snapshot.completedOvers}.${snapshot.ballsInOver}`,
      runRate:
        oversAsNumber > 0
          ? +(snapshot.totalRuns / oversAsNumber).toFixed(2)
          : 0,
    };
  }
}
