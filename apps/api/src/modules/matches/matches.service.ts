import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { MatchEntity } from './entities/match.entity';
import { CreateMatchDto } from './dto/create-match.dto';
import { JwtPayload } from '../auth/types/jwt-payload.interface';

@Injectable()
export class MatchesService {
  constructor(
    @InjectRepository(MatchEntity)
    private readonly matchRepo: Repository<MatchEntity>,
  ) {}

  async createMatch(dto: CreateMatchDto, user: JwtPayload) {
    if (!['admin', 'scorer'].includes(user.role)) {
      throw new ForbiddenException('Only admin/scorer can create match');
    }

    const match = this.matchRepo.create({
      teamAId: dto.teamAId,
      teamBId: dto.teamBId,
      oversLimit: dto.oversLimit,
      startTime: dto.startTime,
      status: 'scheduled',
    });

    return this.matchRepo.save(match);
  }

  async startMatch(matchId: string, user: JwtPayload) {
    if (!['admin', 'scorer'].includes(user.role)) {
      throw new ForbiddenException();
    }

    const match = await this.matchRepo.findOne({ where: { id: matchId } });
    if (!match) throw new NotFoundException('Match not found');

    match.status = 'live';
    return this.matchRepo.save(match);
  }

  async getMatch(matchId: string) {
    const match = await this.matchRepo.findOne({ where: { id: matchId } });
    if (!match) throw new NotFoundException();
    return match;
  }

  async listMatches() {
    return this.matchRepo.find({ order: { createdAt: 'DESC' } });
  }
}
