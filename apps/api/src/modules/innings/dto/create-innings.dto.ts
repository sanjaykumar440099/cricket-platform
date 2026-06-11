import { IsBoolean, IsInt, IsOptional, IsUUID, Min } from 'class-validator';

export class CreateInningsDto {
  @IsUUID()
  matchId!: string;

  @IsUUID()
  battingTeamId!: string;

  @IsUUID()
  bowlingTeamId!: string;

  @IsInt()
  @Min(1)
  inningsNumber!: number;

  @IsOptional()
  @IsBoolean()
  isSuperOver?: boolean;
}
