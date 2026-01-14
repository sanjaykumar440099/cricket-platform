import { PointsTableEntity } from '../tournaments/entities/points-table.entity';

export class PlayoffGenerator {
  static generate(
    teams: PointsTableEntity[],
    format: 'STANDARD' | 'IPL',
  ) {
    if (format === 'STANDARD') {
      return this.standardKnockout(teams);
    }
    return this.iplStyle(teams);
  }

  /** Semi-final → Final */
  private static standardKnockout(teams: PointsTableEntity[]) {
    return [
      {
        stage: 'SEMI_FINAL',
        teamAId: teams[0].teamId,
        teamBId: teams[3].teamId,
      },
      {
        stage: 'SEMI_FINAL',
        teamAId: teams[1].teamId,
        teamBId: teams[2].teamId,
      },
    ];
  }

  /** IPL: Qualifier / Eliminator */
  private static iplStyle(teams: PointsTableEntity[]) {
    return [
      {
        stage: 'QUALIFIER',
        teamAId: teams[0].teamId,
        teamBId: teams[1].teamId,
      },
      {
        stage: 'ELIMINATOR',
        teamAId: teams[2].teamId,
        teamBId: teams[3].teamId,
      },
    ];
  }
}
