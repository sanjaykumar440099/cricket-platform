import { Type } from 'class-transformer';
import {
  IsDate,
  IsInt,
  IsOptional,
  IsUUID,
  Max,
  Min,
} from 'class-validator';

export class CreateMatchDto {
  @IsUUID()
  teamAId!: string;

  @IsUUID()
  teamBId!: string;

  @IsInt()
  @Min(1)
  @Max(90)
  oversLimit!: number;

  @IsOptional()
  @IsUUID()
  tournamentId?: string;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  startTime?: Date;
}
