import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PointsTableEntity } from './entities/points-table.entity';
import { InningsEntity } from '../innings/entities/innings.entity';
import { BallEntity } from '../matches/entities/ball.entity';


@Injectable()
export class PointsTableService {
  constructor(
    @InjectRepository(PointsTableEntity)
    private readonly repo: Repository<PointsTableEntity>,

    @InjectRepository(InningsEntity)
    private readonly inningsRepo: Repository<InningsEntity>,

    @InjectRepository(BallEntity)
    private readonly ballRepo: Repository<BallEntity>,
  ) { }

  async ensureTeam(tournamentId: string, teamId: string) {
    const existing = await this.repo.findOne({
      where: { tournamentId, teamId },
    });

    if (!existing) {
      await this.repo.save({
        tournamentId,
        teamId,
      });
    }
  }

  async recordResult(
    tournamentId: string,
    winnerTeamId: string | null,
    teamAId: string,
    teamBId: string,
    isTie: boolean,
    isNoResult: boolean,
  ) {
    await this.ensureTeam(tournamentId, teamAId);
    await this.ensureTeam(tournamentId, teamBId);

    const teamA = await this.repo.findOneOrFail({
      where: { tournamentId, teamId: teamAId },
    });

    const teamB = await this.repo.findOneOrFail({
      where: { tournamentId, teamId: teamBId },
    });

    teamA.matches++;
    teamB.matches++;

    if (isNoResult) {
      teamA.noResults++;
      teamB.noResults++;
      teamA.points += 1;
      teamB.points += 1;
    } else if (isTie) {
      teamA.ties++;
      teamB.ties++;
      teamA.points += 1;
      teamB.points += 1;
    } else {
      if (winnerTeamId === teamAId) {
        teamA.wins++;
        teamB.losses++;
        teamA.points += 2;
      } else {
        teamB.wins++;
        teamA.losses++;
        teamB.points += 2;
      }
    }

    await this.repo.save([teamA, teamB]);
  }

  async getTable(tournamentId: string) {
    return this.repo.find({
      where: { tournamentId },
      order: { points: 'DESC', netRunRate: 'DESC' },
    });
  }

  async updateNRRForMatch(matchId: string, tournamentId: string) {
    // 1️⃣ Load innings (exclude super overs)
    const inningsList = await this.inningsRepo.find({
      where: { matchId, isSuperOver: false },
    });

    for (const innings of inningsList) {
      const balls = await this.ballRepo.find({
        where: { inningsId: innings.id },
      });

      const totalRuns = balls.reduce(
        (sum, b) => sum + b.runsOffBat + b.extras,
        0,
      );

      const totalBalls = balls.filter(
        b => b.extraType !== 'wide' && b.extraType !== 'no-ball',
      ).length;

      const overs = this.calculateOvers(totalBalls);

      // Batting side
      const battingRow = await this.repo.findOneOrFail({
        where: {
          tournamentId,
          teamId: innings.battingTeamId,
        },
      });

      battingRow.runsFor += totalRuns;
      battingRow.oversFaced += overs;

      // Bowling side
      const bowlingRow = await this.repo.findOneOrFail({
        where: {
          tournamentId,
          teamId: innings.bowlingTeamId,
        },
      });

      bowlingRow.runsAgainst += totalRuns;
      bowlingRow.oversBowled += overs;

      await this.repo.save([battingRow, bowlingRow]);
    }

    // 2️⃣ Recalculate NRR for all teams
    const rows = await this.repo.find({ where: { tournamentId } });

    for (const row of rows) {
      const forRate =
        row.oversFaced > 0 ? row.runsFor / row.oversFaced : 0;
      const againstRate =
        row.oversBowled > 0 ? row.runsAgainst / row.oversBowled : 0;

      row.netRunRate = parseFloat(
        (forRate - againstRate).toFixed(3),
      );
    }

    await this.repo.save(rows);
  }



  private calculateOvers(balls: number): number {
    const overs = Math.floor(balls / 6);
    const remainingBalls = balls % 6;
    return parseFloat(`${overs}.${remainingBalls}`);
  }
}
