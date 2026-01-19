import { BallEntity } from './entity/ball.entity';
import { BallEventDto } from './dto/ball-event.dto';

export function mapBallEntityToDto(entity: BallEntity): BallEventDto {
  return {
    matchId: entity.matchId,
    innings: entity.innings,
    over: entity.over,
    ball: entity.ball,
    runs: entity.runs,
    extraRuns: entity.extraRuns,
    extraType: entity.extraType as BallEventDto['extraType'],
    isWicket: entity.isWicket,
  };
}
