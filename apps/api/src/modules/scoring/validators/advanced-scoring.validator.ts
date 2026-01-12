import { BadRequestException } from '@nestjs/common';
import { CreateBallDto } from '../../balls/dto/create-ball.dto';
import { BallEntity } from 'src/modules/matches/entities/ball.entity';
import { InningsEntity } from '../../innings/entities/innings.entity';
import { BallQueryHelper } from '../../balls/repositories/ball-query.helper';

export class AdvancedScoringValidator {
  static validate(
    dto: CreateBallDto,
    innings: InningsEntity,
    balls: BallEntity[],
    oversLimit: number,
    isFreeHit: boolean
  ) {
    // 1️⃣ Bowler over limit (T20 = 4 overs)
    const maxOversPerBowler = Math.floor(oversLimit / 5);

    const bowlerOvers = BallQueryHelper.oversByBowler(
      balls,
      dto.bowlerId,
    );

    if (bowlerOvers >= maxOversPerBowler) {
      throw new BadRequestException(
        'Bowler has reached maximum overs limit',
      );
    }

    // 2️⃣ Bowler cannot bowl consecutive overs
    const lastBowler = BallQueryHelper.lastOverBowler(balls);

    if (
      lastBowler === dto.bowlerId &&
      dto.ballNumber === 1
    ) {
      throw new BadRequestException(
        'Bowler cannot bowl consecutive overs',
      );
    }

    // 3️⃣ Batter already dismissed cannot bat
    const dismissed = BallQueryHelper.dismissedPlayers(balls);

    if (dismissed.has(dto.strikerId)) {
      throw new BadRequestException(
        'Striker is already dismissed',
      );
    }

    if (dismissed.has(dto.nonStrikerId)) {
      throw new BadRequestException(
        'Non-striker is already dismissed',
      );
    }

    // 4️⃣ Retire hurt logic (soft wicket)
    if (dto.isWicket && dto.dismissedPlayerId) {
      if (dto.dismissedPlayerId === dto.nonStrikerId) {
        throw new BadRequestException(
          'Non-striker cannot be dismissed on this ball',
        );
      }
    }

    // 5️⃣ Free-hit dismissal rules
    if (isFreeHit && dto.isWicket) {
      if (dto.dismissedPlayerId !== dto.strikerId) {
        throw new BadRequestException(
          'Only run-out allowed on free hit',
        );
      }
    }
  }
}
