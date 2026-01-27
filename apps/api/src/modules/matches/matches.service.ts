import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { MatchEntity } from './entities/match.entity';
import { CreateMatchDto } from './dto/create-match.dto';
import { JwtPayload } from '../auth/types/jwt-payload.interface';
import { PointsTableService } from '../tournaments/points-table.service';

import { redis } from '../cache/redis.client';
import { CacheKeys } from '../cache/cache.keys';
import { cleanupMatch } from '../cache/match.cache';
import { Team } from '../teams/entities/team.entity';
import { TournamentEntity } from '../tournaments/entities/tournament.entity';

@Injectable()
export class MatchesService {
  constructor(
    @InjectRepository(MatchEntity)
    private readonly matchRepo: Repository<MatchEntity>,
    @InjectRepository(Team)
    private readonly teamRepo: Repository<Team>,
     @InjectRepository(TournamentEntity)
    private readonly tournamentRepo: Repository<TournamentEntity>,
    private readonly pointsTableService: PointsTableService
  ) { }

  async createMatch(dto: CreateMatchDto, user: JwtPayload) {
    if (!['admin', 'scorer'].includes(user.role)) {
      throw new ForbiddenException('Only admin/scorer can create match');
    }

    const match = this.matchRepo.create({
      teamAId: dto.teamAId,
      teamBId: dto.teamBId,
      oversLimit: dto.oversLimit,
      tournamentId: dto.tournamentId ?? null,
      startTime: dto.startTime ?? null,
      status: 'scheduled',
    } as Partial<MatchEntity>);

    return this.matchRepo.save(match);
  }

  async startMatch(matchId: string, user: JwtPayload) {
    if (!['admin', 'scorer'].includes(user.role)) {
      throw new ForbiddenException();
    }

    const match = await this.matchRepo.findOne({ where: { id: matchId } });
    if (!match) throw new NotFoundException('Match not found');

    match.status = 'live';
    const saved = await this.matchRepo.save(match);

    // 🔴 REGISTER LIVE MATCH
    await redis.sadd(CacheKeys.liveMatches(), matchId);

    return saved;
  }

  async getMatch(matchId: string) {
    const match = await this.matchRepo.findOne({ where: { id: matchId } });
    if (!match) throw new NotFoundException();
    return match;
  }

  async listMatches() {
    return this.matchRepo.find({ order: { createdAt: 'DESC' } });
  }

  async completeMatch(
    matchId: string,
    result: {
      winnerTeamId?: string;
      isTie?: boolean;
      isNoResult?: boolean;
    },
    user: JwtPayload,
  ) {
    if (!['admin', 'scorer'].includes(user.role)) {
      throw new ForbiddenException();
    }

    const match = await this.matchRepo.findOne({ where: { id: matchId } });
    if (!match) throw new NotFoundException('Match not found');

    match.status = 'completed';
    match.winnerTeamId = result.winnerTeamId ?? null;
    match.isTie = !!result.isTie;
    match.isNoResult = !!result.isNoResult;

    await this.matchRepo.save(match);

    // 🏆 UPDATE POINTS TABLE
    if (match.tournamentId) {
      await this.pointsTableService.recordResult(
        match.tournamentId,
        match.winnerTeamId,
        match.teamAId,
        match.teamBId,
        match.isTie,
        match.isNoResult,
      );
    }

    // 🔴 CLEAN REDIS LIVE STATE
    await cleanupMatch(matchId);

    return match;
  }

  async scheduleMatch(dto: CreateMatchDto) {
    const teamA = await this.teamRepo.findOne({
      where: { id: dto.teamAId },
    });
    const teamB = await this.teamRepo.findOne({
      where: { id: dto.teamBId },
    });

    if (!teamA || !teamB)
      throw new NotFoundException('Team not found');

    const match = this.matchRepo.create({
      teamA,
      teamB,
      oversLimit: dto.oversLimit,
      startTime: dto.startTime,
    });

    if (dto.tournamentId) {
      const tournament = await this.tournamentRepo.findOne({
        where: { id: dto.tournamentId },
      });
      if (!tournament)
        throw new NotFoundException('Tournament not found');
      match.tournament = tournament;
    }

    return this.matchRepo.save(match);
  }

}
