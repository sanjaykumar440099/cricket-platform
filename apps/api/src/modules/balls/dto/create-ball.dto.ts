import { ExtraType } from '../../scoring/domain/ball.event';

export class CreateBallDto {
  inningsId!: string;

  overNumber!: number;
  ballNumber!: number;

  strikerId!: string;
  nonStrikerId!: string;
  bowlerId!: string;

  runsOffBat!: number;
  extras!: number;
  extraType!: ExtraType;

  isWicket!: boolean;
  dismissedPlayerId?: string;

  fieldersOutsideCircle!: number;
}
