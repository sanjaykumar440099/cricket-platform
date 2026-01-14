import { BadRequestException } from '@nestjs/common';
import { InningsEntity } from '../../innings/entities/innings.entity';
import { ScoreSnapshotEntity } from '../../scores/entities/score-snapshot.entity';

export class SuperOverValidator {
  static validate(
    innings: InningsEntity,
    snapshot: ScoreSnapshotEntity | null,
  ) {
    if (!innings.isSuperOver || !snapshot) return;

    const legalBalls =
      snapshot.completedOvers * 6 + snapshot.ballsInOver;

    if (legalBalls >= 6) {
      throw new BadRequestException(
        'Super Over completed (6 balls bowled)',
      );
    }

    if (snapshot.wickets >= 2) {
      throw new BadRequestException(
        'Super Over completed (2 wickets fallen)',
      );
    }
  }
}
