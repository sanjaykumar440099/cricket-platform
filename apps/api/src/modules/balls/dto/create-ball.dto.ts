import { ExtraType } from '../../scoring/domain/ball.event';
import {
  IsBoolean,
  IsInt,
  IsIn,
  IsOptional,
  IsUUID,
  Max,
  Min,
} from 'class-validator';

export class CreateBallDto {
  @IsUUID()
  inningsId!: string;

  @IsInt()
  @Min(1)
  overNumber!: number;

  @IsInt()
  @Min(1)
  @Max(6)
  ballNumber!: number;

  @IsUUID()
  strikerId!: string;

  @IsUUID()
  nonStrikerId!: string;

  @IsUUID()
  bowlerId!: string;

  @IsInt()
  @Min(0)
  @Max(6)
  runsOffBat!: number;

  @IsInt()
  @Min(0)
  @Max(7)
  extras!: number;

  @IsOptional()
  @IsIn(['wide', 'no-ball', 'bye', 'leg-bye'])
  extraType!: ExtraType;

  @IsBoolean()
  isWicket!: boolean;

  @IsOptional()
  @IsUUID()
  dismissedPlayerId?: string;

  @IsInt()
  @Min(0)
  @Max(9)
  fieldersOutsideCircle!: number;
}
