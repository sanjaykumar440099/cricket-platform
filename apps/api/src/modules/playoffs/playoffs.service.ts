import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { PlayoffMatchEntity } from './entities/playoff-match.entity';
import { CreatePlayoffDto } from './dto/create-playoff.dto';
import { PlayoffGenerator } from './playoff.generator';
import { PointsTableService } from '../tournaments/points-table.service';
import { GeneratePlayoffsDto } from './dto/generate-playoffs.dto';
import { NEXT_STAGE_RULES, PlayoffStage } from './playoff.rules';

@Injectable()
export class PlayoffsService {
  constructor(
    @InjectRepository(PlayoffMatchEntity)
    private readonly repo: Repository<PlayoffMatchEntity>,

    private readonly pointsTableService: PointsTableService,
  ) { }

  createPlayoff(dto: CreatePlayoffDto) {
    return this.repo.save(dto);
  }

  // ✅ FIXED: now auto-advances
  async completePlayoff(
    playoffMatchId: string,
    winnerTeamId: string,
  ) {
    const match = await this.repo.findOne({
      where: { id: playoffMatchId },
    });

    if (!match) {
      throw new NotFoundException('Playoff match not found');
    }

    match.winnerTeamId = winnerTeamId;
    match.isCompleted = true;

    await this.repo.save(match);

    // ✅ format comes from DB
    await this.autoAdvanceWinner(playoffMatchId, match.format);

    return match;
  }


  listByTournament(tournamentId: string) {
    return this.repo.find({
      where: { tournamentId },
      order: { createdAt: 'ASC' },
    });
  }

  async generatePlayoffs(dto: GeneratePlayoffsDto) {
    const table = await this.pointsTableService.getTable(
      dto.tournamentId,
    );

    if (table.length < dto.topTeams) {
      throw new Error('Not enough teams for playoffs');
    }

    const qualifiedTeams = table.slice(0, dto.topTeams);

    // Prevent duplicates
    const existing = await this.repo.find({
      where: { tournamentId: dto.tournamentId },
    });

    if (existing.length > 0) {
      return existing;
    }

    const playoffMatches = PlayoffGenerator.generate(
      qualifiedTeams,
      dto.format,
    );

    const entities = playoffMatches.map(pm =>
      this.repo.create({
        tournamentId: dto.tournamentId,
        stage: pm.stage,
        teamAId: pm.teamAId,
        teamBId: pm.teamBId,
        format: dto.format, // ✅ STORED
        isCompleted: false,
        winnerTeamId: null,
      } as Partial<PlayoffMatchEntity>),
    );

    return this.repo.save(entities);
  }

  // =========================
  // 🔁 AUTO-ADVANCE ENGINE
  // =========================

  async autoAdvanceWinner(
    playoffMatchId: string,
    format: 'STANDARD' | 'IPL',
  ) {
    const match = await this.repo.findOne({
      where: { id: playoffMatchId },
    });

    if (!match || !match.isCompleted || !match.winnerTeamId) {
      return;
    }

    const winnerTeamId = match.winnerTeamId;
    const loserTeamId =
      match.teamAId === winnerTeamId
        ? match.teamBId
        : match.teamAId;

    if (!loserTeamId) return;

    // STANDARD
    if (format === 'STANDARD') {
      if (match.stage === 'SEMI_FINAL') {
        await this.addTeamToStage(
          match.tournamentId,
          'FINAL',
          winnerTeamId,
        );
      }
      return;
    }

    // IPL
    if (match.stage === 'QUALIFIER') {
      await this.addTeamToStage(
        match.tournamentId,
        'FINAL',
        winnerTeamId,
      );
      await this.addTeamToStage(
        match.tournamentId,
        'QUALIFIER_2',
        loserTeamId,
      );
    }

    if (match.stage === 'ELIMINATOR') {
      await this.addTeamToStage(
        match.tournamentId,
        'QUALIFIER_2',
        winnerTeamId,
      );
    }

    if (match.stage === 'QUALIFIER_2') {
      await this.addTeamToStage(
        match.tournamentId,
        'FINAL',
        winnerTeamId,
      );
    }
  }


  // =========================
  // 🧠 BRACKET SLOT FILLER
  // =========================

  private async addTeamToStage(
    tournamentId: string,
    stage: PlayoffStage,
    teamId: string,
  ) {
    let match = await this.repo.findOne({ where: { tournamentId, stage } });

    if (!match) {
      match = this.repo.create({
        tournamentId,
        stage,
        teamAId: teamId,
        teamBId: null,
        isCompleted: false,
        winnerTeamId: null,
      } as Partial<PlayoffMatchEntity>);
    } else if (!match.teamAId) {
      match.teamAId = teamId;
    } else if (!match.teamBId) {
      match.teamBId = teamId;
    }

    await this.repo.save(match);
  }

  async getBracket(tournamentId: string) {
    const matches = await this.repo.find({
      where: { tournamentId },
      order: { createdAt: 'ASC' },
    });

    const stageMap = new Map<string, any[]>();

    for (const match of matches) {
      if (!stageMap.has(match.stage)) {
        stageMap.set(match.stage, []);
      }

      stageMap.get(match.stage)!.push({
        matchId: match.id,
        stage: match.stage,
        teamAId: match.teamAId,
        teamBId: match.teamBId,
        winnerTeamId: match.winnerTeamId,
        isCompleted: match.isCompleted,
      });
    }

    return {
      tournamentId,
      stages: Array.from(stageMap.entries()).map(
        ([stage, matches]) => ({
          stage,
          matches,
        }),
      ),
    };
  }

}
