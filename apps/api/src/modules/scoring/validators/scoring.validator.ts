import { BadRequestException } from '@nestjs/common';
import { CreateBallDto } from '../../balls/dto/create-ball.dto';
import { InningsEntity } from '../../innings/entities/innings.entity';

export class ScoringValidator {
  /** Validate before inserting a ball */
  static validateBall(
    dto: CreateBallDto,
    innings: InningsEntity,
    currentBallsInOver: number,
    oversLimit: number,
  ) {
    // 1️⃣ Innings must be active
    if (innings.isCompleted) {
      throw new BadRequestException('Innings already completed');
    }

    // 2️⃣ Runs sanity
    if (dto.runsOffBat < 0 || dto.extras < 0) {
      throw new BadRequestException('Runs cannot be negative');
    }

    // 3️⃣ Extra rules
    if (dto.extraType === 'wide' || dto.extraType === 'no-ball') {
      if (dto.extras === 0) {
        throw new BadRequestException('Wide/No-ball must have extras');
      }
    }

    if ((dto.extraType === 'bye' || dto.extraType === 'leg-bye') && dto.runsOffBat !== 0) {
      throw new BadRequestException('Byes/leg-byes cannot have bat runs');
    }

    // 4️⃣ Wicket rules
    if (dto.isWicket && !dto.dismissedPlayerId) {
      throw new BadRequestException('Dismissed player is required');
    }

    // 5️⃣ Ball count rules
    if (currentBallsInOver > 5) {
      throw new BadRequestException('Over already completed');
    }

    // 6️⃣ Overs limit
    if (innings.inningsNumber === 2 && oversLimit !== null) {
      // second innings overs limit enforcement (optional rule hook)
    }
  }
}
